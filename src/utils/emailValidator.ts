export const emailValidator = (email: string): boolean => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};