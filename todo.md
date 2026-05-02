# Digital Legacy Vault - Development TODO

## Phase 1: Database Schema & Core Infrastructure
- [x] Design and implement database schema (users, assets, executors, check-ins, encryption keys)
- [x] Create Drizzle ORM schema with all required tables
- [x] Generate and apply database migrations
- [x] Implement encryption key management system
- [x] Set up audit logging for sensitive operations

## Phase 2: Authentication & Role-Based Access Control
- [x] Extend user roles (user, executor, admin)
- [x] Implement user registration and profile management
- [x] Add executor role assignment and management
- [x] Build role-based access control middleware
- [x] Create protected procedures for user vs executor operations

## Phase 3: Dead Man's Switch System
- [x] Implement check-in tracking database table
- [x] Create check-in mutation (user confirms they're alive)
- [x] Build check-in status query (shows last check-in date)
- [ ] Implement background job to detect missed check-ins (2 consecutive)
- [x] Create executor notification system for missed check-ins
- [x] Build check-in history and status dashboard

## Phase 4: Encrypted Asset Vault
- [x] Design asset categorization system (crypto, social media, passwords, etc.)
- [x] Implement asset storage table with encryption support
- [x] Create asset CRUD operations with encryption/decryption
- [x] Build asset categorization and tagging interface
- [ ] Implement secure asset deletion with key rotation
- [x] Create asset listing and search functionality

## Phase 5: Executor Management & Workflows
- [x] Build executor designation interface (add/remove executors)
- [x] Implement executor invitation system
- [ ] Create executor acceptance/rejection flow
- [ ] Build death certificate upload system
- [ ] Implement death verification workflow
- [ ] Create executor access control after verification
- [ ] Build asset transfer authorization system

## Phase 6: AI Digital Executor Integration
- [x] Design gap analysis algorithm (identify missing asset types)
- [x] Integrate LLM for estate planning guidance
- [ ] Build proactive prompting system for missing information
- [x] Create AI-generated recommendations for estate planning
- [x] Implement AI chat interface for legal guidance questions
- [x] Build gap analysis dashboard showing coverage status

## Phase 7: Executor Dashboard & Asset Transfer
- [ ] Create executor dashboard layout
- [ ] Build pending notifications display
- [ ] Implement death certificate upload interface
- [ ] Create asset viewing interface for executors
- [ ] Build asset transfer/download workflows
- [ ] Implement executor action logging and audit trail

## Phase 8: Frontend UI & User Experience
- [ ] Design visual style and color scheme
- [x] Create landing page and marketing copy
- [x] Build user dashboard layout
- [x] Implement asset management interface
- [x] Create executor management interface
- [x] Build check-in reminder UI
- [ ] Create comprehensive help/guidance documentation

## Phase 9: Security & Encryption
- [x] Implement end-to-end encryption for sensitive data
- [x] Create hybrid encryption system (user + executor keys)
- [ ] Execute database migration SQL to create all tables

## Phase 10: Legal & Compliance
- [x] Add Privacy Policy page
- [x] Add Terms of Service page
- [ ] Add data deletion workflow
- [ ] Add account management interface
- [x] Build time-locked vault for executor key escrow
- [x] Implement secure key derivation from passwords
- [x] Add rate limiting for sensitive operations
- [x] Implement CSRF protection and security headers
- [x] Create security audit logging

## Phase 11: Executor Dashboard & Background Jobs
- [x] Create executor dashboard layout
- [x] Build pending notifications display
- [x] Implement death certificate upload interface
- [ ] Build asset transfer/download workflows
- [x] Create background job framework
- [ ] Deploy background job scheduler

## Phase 12: Stripe Integration & Deployment
- [ ] Set up Stripe API keys
- [ ] Create payment checkout page
- [ ] Implement payment verification
- [ ] Add paywall before asset storage
- [ ] Test payment workflows

## Phase 13: Testing & Deployment
- [ ] Write unit tests for core business logic
- [ ] Write integration tests for workflows
- [ ] Perform security audit and penetration testing
- [ ] Test Dead Man's Switch notification system
- [ ] Test encryption/decryption workflows
- [ ] Verify executor access controls
- [ ] Deploy and monitor production environment

## Security Checklist
- [ ] All sensitive data encrypted at rest
- [ ] All API endpoints require authentication
- [ ] Executor access only after death verification
- [ ] Audit logging for all sensitive operations
- [ ] Rate limiting on check-in and notifications
- [ ] Secure password hashing and key derivation
- [ ] HTTPS enforced, security headers configured
- [ ] Database backups encrypted and tested
- [ ] Incident response plan documented

## Known Constraints & Decisions
- Encryption approach: Hybrid (user encryption + executor key escrow)
- Check-in interval: 30 days, 2 consecutive misses trigger notification
- Asset types supported: Crypto keys, social media, domains, passwords, business logins, personal messages
- AI integration: Proactive gap analysis + reactive guidance chatbot
