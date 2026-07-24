export async function uploadImage(file: File, _path?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    } catch {
      reject(new Error("File upload not available in this environment. Use an image URL instead."));
    }
  });
}
