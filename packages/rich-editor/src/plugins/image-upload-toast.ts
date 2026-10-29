import { toast, updateToast } from '@haklex/rich-editor-ui';

const ERROR_TOAST_DURATION = 6000;

function plural(count: number, one: string, many: string): string {
  return count > 1 ? many.replace('#', String(count)) : one;
}

export async function reportImageUploads(
  files: File[],
  run: (batch: File[]) => Promise<File[]>,
): Promise<void> {
  const attempt = async (batch: File[]) => {
    const id = toast({
      title: plural(batch.length, 'Uploading image…', 'Uploading # images…'),
      tone: 'loading',
    });
    const failed = await run(batch);
    if (failed.length === 0) {
      updateToast(id, {
        title: plural(batch.length, 'Image inserted', 'Inserted # images'),
        tone: 'success',
      });
      return;
    }
    updateToast(id, {
      action: { label: 'Retry', onClick: () => void attempt(failed) },
      duration: ERROR_TOAST_DURATION,
      title: plural(failed.length, 'Image upload failed', '# images failed to upload'),
      tone: 'error',
    });
  };
  await attempt(files);
}
