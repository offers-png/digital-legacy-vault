import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  recordCheckIn,
  getLastCheckIn,
  getCheckInHistory,
  designateExecutor,
  getExecutorsForUser,
  acceptExecutorDesignation,
  uploadDeathCertificate,
  getDeathVerification,
  verifyDeath,
  createAsset,
  getAssets,
  getAssetsByCategory,
  getAsset,
  updateAsset,
  deleteAsset,
  saveEncryptionKey,
  getEncryptionKey,
  createNotification,
  getNotifications,
  markNotificationAsRead,
  logAuditEvent,
} from "./queries";
import {
  generateMasterKey,
  encryptMasterKey,
  generateInvitationToken,
  encryptAssetData,
  decryptAssetData,
  encryptExecutorKey,
} from "./encryption";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";

/**
 * Dead Man's Switch Router
 */
export const checkInRouter = router({
  // Record a check-in for the current user
  recordCheckIn: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await recordCheckIn(ctx.user.id);
      await logAuditEvent(
        ctx.user.id,
        "check_in_recorded",
        "check_in",
        null,
        {},
        ctx.req.headers["x-forwarded-for"] as string
      );
      return { success: true };
    } catch (error) {
      console.error("Failed to record check-in:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  // Get the user's last check-in date
  getLastCheckIn: protectedProcedure.query(async ({ ctx }) => {
    try {
      const lastCheckIn = await getLastCheckIn(ctx.user.id);
      return { lastCheckIn, daysAgo: lastCheckIn ? Math.floor((Date.now() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24)) : null };
    } catch (error) {
      console.error("Failed to get last check-in:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  // Get check-in history
  getCheckInHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const history = await getCheckInHistory(ctx.user.id);
      return history;
    } catch (error) {
      console.error("Failed to get check-in history:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});

/**
 * Executor Management Router
 */
export const executorRouter = router({
  // Designate a new executor
  designateExecutor: protectedProcedure
    .input(
      z.object({
        executorEmail: z.string().email(),
        executorName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // In a real app, you'd look up the executor by email
        // For now, we'll use a placeholder
        const executorId = Math.floor(Math.random() * 10000); // Placeholder
        const invitationToken = generateInvitationToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await designateExecutor(ctx.user.id, executorId, invitationToken, expiresAt);
        await logAuditEvent(
          ctx.user.id,
          "executor_designated",
          "executor_designation",
          executorId,
          { executorEmail: input.executorEmail },
          ctx.req.headers["x-forwarded-for"] as string
        );

        return { success: true, invitationToken };
      } catch (error) {
        console.error("Failed to designate executor:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Get executors for the current user
  getExecutors: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getExecutorsForUser(ctx.user.id);
    } catch (error) {
      console.error("Failed to get executors:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  // Accept executor designation
  acceptDesignation: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await acceptExecutorDesignation(input.userId, ctx.user.id);
        await logAuditEvent(
          ctx.user.id,
          "executor_accepted",
          "executor_designation",
          input.userId,
          {},
          ctx.req.headers["x-forwarded-for"] as string
        );
        return { success: true };
      } catch (error) {
        console.error("Failed to accept designation:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});

/**
 * Digital Asset Router
 */
export const assetRouter = router({
  // Create a new asset
  createAsset: protectedProcedure
    .input(
      z.object({
        category: z.enum(["crypto", "social_media", "domain", "password", "business_login", "personal_message"]),
        name: z.string(),
        description: z.string().optional(),
        assetData: z.record(z.string(), z.any()), // Sensitive data to encrypt
        password: z.string(), // User's password for key derivation
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get or create encryption key
        let encKey = await getEncryptionKey(ctx.user.id);
        let masterKey = generateMasterKey();

        if (!encKey) {
          // Create new master key
          const { encryptedKey, iv, salt, authTag } = encryptMasterKey(masterKey, input.password);
          await saveEncryptionKey(ctx.user.id, encryptedKey, salt);
          encKey = { encryptedMasterKey: encryptedKey, keyDerivationSalt: salt } as any;
        }

        // Encrypt asset data
        const assetJson = JSON.stringify(input.assetData);
        const { encryptedData, iv: assetIv, authTag } = encryptAssetData(assetJson, masterKey);

        // Create executor encrypted key
        const executors = await getExecutorsForUser(ctx.user.id);
        let executorEncryptedKey: string | null = null;
        if (executors.length > 0) {
          const { encryptedKey, iv: execIv, authTag: execTag } = encryptExecutorKey(masterKey, executors[0].executorId);
          executorEncryptedKey = JSON.stringify({ encryptedKey, iv: execIv, authTag: execTag });
        }

        const asset = await createAsset(
          ctx.user.id,
          input.category,
          input.name,
          input.description || null,
          encryptedData,
          assetIv,
          executorEncryptedKey
        );

        await logAuditEvent(
          ctx.user.id,
          "asset_created",
          "digital_asset",
          asset.id,
          { category: input.category },
          ctx.req.headers["x-forwarded-for"] as string
        );

        return { success: true, assetId: asset.id };
      } catch (error) {
        console.error("Failed to create asset:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Get all assets for the user
  getAssets: protectedProcedure.query(async ({ ctx }) => {
    try {
      const assets = await getAssets(ctx.user.id);
      // Don't return encrypted data in list view
      return assets.map((a) => ({
        id: a.id,
        category: a.category,
        name: a.name,
        description: a.description,
        createdAt: a.createdAt,
      }));
    } catch (error) {
      console.error("Failed to get assets:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  // Get assets by category
  getAssetsByCategory: protectedProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const assets = await getAssetsByCategory(ctx.user.id, input.category);
        return assets.map((a) => ({
          id: a.id,
          category: a.category,
          name: a.name,
          description: a.description,
          createdAt: a.createdAt,
        }));
      } catch (error) {
        console.error("Failed to get assets by category:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Delete an asset
  deleteAsset: protectedProcedure
    .input(z.object({ assetId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await deleteAsset(input.assetId, ctx.user.id);
        await logAuditEvent(
          ctx.user.id,
          "asset_deleted",
          "digital_asset",
          input.assetId,
          {},
          ctx.req.headers["x-forwarded-for"] as string
        );
        return { success: true };
      } catch (error) {
        console.error("Failed to delete asset:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});

/**
 * Death Verification Router
 */
export const deathRouter = router({
  // Upload death certificate
  uploadDeathCertificate: protectedProcedure
    .input(
      z.object({
        userId: z.number(), // Asset owner
        certificateFile: z.instanceof(Buffer),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Upload to S3
        const { url } = await storagePut(
          `death-certificates/${input.userId}-${Date.now()}.pdf`,
          input.certificateFile,
          "application/pdf"
        );

        await uploadDeathCertificate(input.userId, ctx.user.id, url);
        await logAuditEvent(
          ctx.user.id,
          "death_certificate_uploaded",
          "death_verification",
          input.userId,
          {},
          ctx.req.headers["x-forwarded-for"] as string
        );

        return { success: true };
      } catch (error) {
        console.error("Failed to upload death certificate:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  // Get death verification status
  getDeathVerificationStatus: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const verification = await getDeathVerification(input.userId);
        return verification;
      } catch (error) {
        console.error("Failed to get death verification status:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});

/**
 * AI Digital Executor Router
 */
export const aiExecutorRouter = router({
  // Get gap analysis for assets
  getGapAnalysis: protectedProcedure.query(async ({ ctx }) => {
    try {
      const assets = await getAssets(ctx.user.id);
      const categories = ["crypto", "social_media", "domain", "password", "business_login", "personal_message"];
      const missingCategories = categories.filter(
        (cat) => !assets.some((a) => a.category === cat)
      );

      const prompt = `
You are a digital estate planning expert. A user has stored the following digital assets:
${assets.map((a) => `- ${a.category}: ${a.name}`).join("\n")}

Missing asset categories: ${missingCategories.join(", ")}

Provide 3-5 specific, actionable recommendations for what digital assets they should add to their estate plan.
Focus on practical advice and common assets people forget about.
`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a helpful digital estate planning advisor.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const recommendations = response.choices[0]?.message.content || "";

      return {
        missingCategories,
        recommendations,
        assetCount: assets.length,
        coverage: Math.round((assets.length / categories.length) * 100),
      };
    } catch (error) {
      console.error("Failed to get gap analysis:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  // Get AI guidance on estate planning
  getEstateGuidance: protectedProcedure
    .input(z.object({ question: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a digital estate planning expert. Provide clear, practical guidance on managing digital assets and estate planning. Do not provide legal advice, but general information.",
            },
            {
              role: "user",
              content: input.question,
            },
          ],
        });

        return {
          guidance: response.choices[0]?.message.content || "",
        };
      } catch (error) {
        console.error("Failed to get estate guidance:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});

/**
 * Notification Router
 */
export const notificationRouter = router({
  // Get notifications for executor
  getNotifications: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getNotifications(ctx.user.id);
    } catch (error) {
      console.error("Failed to get notifications:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await markNotificationAsRead(input.notificationId);
        return { success: true };
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
