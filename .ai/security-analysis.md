# Wedding Website Security Analysis Report

## Executive Summary

This document provides a comprehensive security analysis of the Ryan & Erin wedding website project. The analysis identified several critical security vulnerabilities and inconsistencies that require immediate attention. While the project implements some security best practices, there are significant risks related to environment variable handling, authentication implementation, and database access patterns.

## Critical Security Findings

### 1. Environment Variable Inconsistencies (CRITICAL)

**Issue**: Multiple environment variable naming inconsistencies across the codebase
- **Files affected**: `lib/supabase.ts`, `lib/supabaseServer.ts`, `utils/supabase/client.ts`, `utils/supabase/server.ts`, `next.config.js`, `app/api/rsvp/route.ts`
- **Variable names found**:
  - `SUPABASE_URL` vs `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_KEY` vs `SUPABASE_ANON_KEY` vs `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

**Impact**: Environment variables not properly loaded, causing runtime errors and potential security exposure

**Recommendation**: Standardize environment variable naming and ensure all files use consistent naming conventions

### 2. Hardcoded Password References (HIGH)

**Issue**: Hardcoded password references found in multiple locations
- **Files affected**: 
  - `lib/hashTest.ts`: Contains `BRIDESTAYIRIE`, `GROOMSTAYIRIE`, `PLANNERSTAYIRIE`
  - `scripts/create-admin-users.sql`: Contains simple password hashes `GR00M`, `BR1D3`, `PLANN3R`
  - `attached_assets/` files contain debugging information with password references

**Impact**: Potential credential exposure and weak password implementation

**Recommendation**: Remove hardcoded passwords and implement proper credential management

### 3. Environment Variable Swapping in Server Configuration (HIGH)

**Issue**: `lib/supabaseServer.ts` contains commented workaround for swapped environment variables
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Contains URL due to Replit secrets
```

**Impact**: Incorrect environment variable usage leading to connection failures

**Recommendation**: Fix environment variable assignments and remove workarounds

### 4. Exposed Sensitive Information in Debug Logs (MEDIUM)

**Issue**: Extensive console logging in API routes that exposes sensitive information
- **Files affected**: `app/api/rsvp/route.ts`, `api/admin/rsvps/route.ts`, `lib/supabase.ts`
- **Log examples**:
  ```javascript
  console.log("[v0] RSVP submission received:", { guest_name, email, attendance });
  console.log('Supabase Key:', supabaseKey ? 'Set (hidden)' : 'Missing');
  ```

**Impact**: Sensitive data exposure in development and potentially production logs

**Recommendation**: Remove or reduce debug logging, implement proper logging levels

## Authentication & Authorization Analysis

### Positive Findings:
- Custom JWT implementation using HMAC with timing-safe comparison (`lib/auth.ts`)
- Proper password hashing with scrypt-js and random salt generation (`lib/crypto.ts`)
- Cookie-based authentication with httpOnly and secure flags
- Server-side authentication utilities for admin routes

### Security Concerns:
- JWT secret environment variable (`JWT_SECRET`) implementation appears incomplete
- Admin password storage inconsistency between hashed and plaintext values
- No rate limiting on authentication endpoints
- Missing session invalidation implementation

### Admin Authentication Issues:
1. **Password Mismatch**: `scripts/create-admin-users.sql` uses simple hashes while code expects scrypt hashes
2. **Inconsistent Storage**: Database stores `password_hash` and `salt` separately, but verification expects colon-separated format
3. **Hardcoded Values**: Test passwords are embedded in multiple files

## Database Security Analysis

### Row Level Security (RLS):
- RLS policies exist but implementation has fallback to service role client
- Service role client used to bypass RLS when errors occur
- No visible RLS policy definitions in the codebase

### Database Access Patterns:
- Dual client implementation (client-side and server-side)
- Service role key used for admin operations
- Fallback pattern from anon key to service role key in case of RLS errors

### Concerns:
- Environment variable confusion leads to connection failures
- Potential for privilege escalation through service role client misuse
- No visible database backup or recovery procedures

## API Security Analysis

### Input Validation:
- Basic validation exists for required fields (`guest_name`, `email`, `attendance`)
- Attendance value validation (`yes`/`no`)
- Missing comprehensive input sanitization

### Data Handling:
- Upsert operations with conflict resolution on `email` field
- No CSRF protection visible on API routes
- Missing request rate limiting

### Error Handling:
- Error messages potentially expose sensitive information
- Fallback to service role client logs sensitive connection details
- No standardized error response format

## Web3/Wallet Security Analysis

### Dependencies:
- `@abstract-foundation/agw-react` for Abstract Global Wallet integration
- `@privy-io/react-auth` for authentication
- `thirdweb`, `wagmi`, `viem` for Web3 functionality

### Security Considerations:
- All dependencies are using latest versions (positive for security updates)
- Web3 integration appears to follow current best practices
- No visible private key handling in the frontend code

## File and Infrastructure Security

### File Permissions:
- All files have world-readable permissions (777/666)
- No sensitive configuration files with restricted access
- Public folder contains only static assets

### Configuration Security:
- `next.config.js` properly excludes Storybook dependencies
- Build errors and ESLint disabled during builds (development only)
- X-Frame-Options set to SAMEORIGIN

### Git Security:
- No `.env` files committed to repository (good practice)
- Some debugging information in attached_assets contains sensitive references
- No visible git hooks for security checks

## Recommendations by Priority

### Immediate Actions (Critical):
1. **Fix Environment Variable Consistency**: Standardize naming and usage across all files
2. **Remove Hardcoded Credentials**: Eliminate password references from code files
3. **Fix Server Configuration**: Correct the swapped environment variable assignments

### Short-term Actions (High Priority):
1. **Implement Proper Logging**: Remove sensitive information from console logs
2. **Standardize Admin Authentication**: Fix password hashing inconsistencies
3. **Add Rate Limiting**: Implement on authentication and API endpoints

### Medium-term Actions (Medium Priority):
1. **Security Testing**: Conduct penetration testing and security scanning
2. **Error Handling**: Standardize error responses without information leakage
3. **Session Management**: Implement proper session invalidation

### Long-term Actions (Low Priority):
1. **Security Monitoring**: Implement security event logging and monitoring
2. **Backup Strategy**: Develop database backup and recovery procedures
3. **Security Training**: Team training on secure coding practices

## Compliance Considerations

### Data Privacy:
- Guest information collection (name, email, dietary restrictions)
- No visible privacy policy or data handling documentation
- Consider GDPR/CCPA compliance for guest data

### Payment Processing:
- No payment processing visible in current implementation
- Future considerations for gift registry or payment features

## Conclusion

The wedding website project shows a mixed security posture with some good practices but several critical vulnerabilities that need immediate attention. The most pressing issues are environment variable inconsistencies, hardcoded credentials, and improper logging practices. Addressing these issues will significantly improve the security posture of the application.

The Web3 integration appears to follow current best practices, and the authentication framework is well-designed but needs proper implementation. With the recommended fixes, this project can achieve a good security level suitable for a wedding website application.

## Risk Assessment

- **Overall Risk Level**: MEDIUM-HIGH
- **Primary Risks**: Credential exposure, data leakage through logs, authentication bypass
- **Attack Surface**: Web interface, API endpoints, admin authentication
- **Data Sensitivity**: Medium (personal guest information, attendance data)

## Next Steps

1. Immediately address critical environment variable issues
2. Remove all hardcoded credentials and references
3. Implement proper logging and error handling
4. Conduct security testing after fixes
5. Establish ongoing security monitoring practices

---
*Generated on: 2025-09-23*
*Analysis Version: 1.0*