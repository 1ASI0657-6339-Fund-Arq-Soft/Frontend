import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  /**
   * Hash a password using SHA-256
   * This is a simple implementation for compatibility with the backend
   * Note: In production, use proper password hashing like bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Simple consistent hash for both registration and login
   * Since the backend has inconsistent password handling, we'll use a simple approach
   * that works with the current backend implementation
   */
  async createSimpleConsistentHash(password: string): Promise<string> {
    // Use a simple but consistent transformation
    // This will be used for both signup and signin to maintain consistency
    const prefix = 'hash_';
    const hash = await this.hashPassword(password);
    return prefix + hash.substring(0, 50); // Use first 50 chars for reasonable length
  }

  /**
   * TEMPORARY WORKAROUND: Return password as-is due to backend bug
   * 
   * BACKEND ISSUE IDENTIFIED:
   * - SignUpCommand saves passwords in plaintext (line 80 in UserCommandServiceImpl.java)
   * - SignInCommand uses BCrypt.matches() expecting hashed passwords (line 55)
   * - This creates an inconsistency where signin always fails
   * 
   * PROPER FIX NEEDED IN BACKEND:
   * Either:
   * 1. Use hashingService.encode() in signup: 
   *    String hashedPassword = hashingService.encode(command.password());
   * 2. Or do plaintext comparison in signin instead of BCrypt.matches()
   * 
   * For now, we return password as-is to match current backend behavior
   */
  async compatibilityHash(password: string): Promise<string> {
    console.warn('Using plaintext passwords due to backend inconsistency');
    console.warn('Backend needs to be fixed: either hash in signup OR use plaintext comparison in signin');
    return password;
  }
}