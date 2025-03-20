import * as argon2 from "argon2";

export class PasswordEncryptor {
  async encrypt(password: string): Promise<string> {
    return await argon2.hash(password);
  }

  async verify(hashedPassword: string, plainPassword: string): Promise<boolean> {
    return await argon2.verify(hashedPassword, plainPassword);
  }
}