export function getProtectedRoute(targetPath: string, isLoggedIn: boolean) {
  if (isLoggedIn) {
    return targetPath;
  }

  return `/not-logged?redirect=${encodeURIComponent(targetPath)}`;
}
