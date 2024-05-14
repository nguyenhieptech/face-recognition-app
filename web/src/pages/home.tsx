import { useMediaFilesQuery, useUploadMediaMutation } from "@/api";
import { DashboardLayout } from "@/components/dashboard";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ImageIcon,
  Loader2,
  SearchIcon,
  Trash2,
  UploadCloud,
  UploadIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";

// Reference: https://gist.github.com/nguyenhieptech/6f7e0eb97de8cfe8076b8f589dcd90d2
export function HomePage() {
  const [isUploadMediaDialogOpen, setIsUploadMediaDialogOpen] = useState(false);

  const [files, setFiles] = useState<File[]>([]);
  const [mediaFileFormData, setMediaFile] = useState<FormData>();
  const [loadingState, setLoadingState] = useState<Record<string, boolean>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>(
    {}
  );
  const [dragOver, setDragOver] = useState(false);
  const [fileDropError, setFileDropError] = useState("");

  const mediaFilesQuery = useMediaFilesQuery();
  const mutation = useUploadMediaMutation(mediaFileFormData!);

  function handleDragOver(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOver(false);

    const selectedFiles = Array.from(e.dataTransfer.files);
    if (selectedFiles.some((file) => file.type.split("/")[0] !== "image")) {
      return setFileDropError("Please provide only image files to upload!");
    }

    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    setFileDropError("");
  }

  function handleChangeFile(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files as FileList);
    if (selectedFiles.some((file) => file.type.split("/")[0] !== "image")) {
      return setFileDropError("Please provide only image files to upload!");
    }
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    setFileDropError("");
  }

  function simulateLoading(file: File) {
    // Calculates the duration of the timer in milliseconds
    const duration = Math.max(1000, Math.min(file.size / 750, 4000));
    setLoadingState((prev) => ({ ...prev, [file.name]: true }));
    setTimeout(() => {
      setLoadingState((prev) => ({ ...prev, [file.name]: false }));
    }, duration);
  }

  function formatFileSize(number: number, unit: "Bytes" | "MB" = "MB") {
    if (unit === "Bytes") {
      const sizeInBytes = number
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      return `${sizeInBytes} ${unit}`;
    } else if (unit === "MB") {
      const sizeInMB = number / (1024 * 1024); // Convert to MB
      return `${sizeInMB.toFixed(3)} ${unit}`;
    }

    return "";
  }

  function generatePreview(file: File) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviews((prev) => ({
        ...prev,
        [file.name]: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  }

  function handleDelete(fileName: string) {
    // Filter the files to remove the selected one
    setFiles(files.filter((file) => file.name !== fileName));
  }

  function handleUploadMediaFile() {
    setFiles([]);
    setFileDropError("");

    const fileFormData = new FormData();
    fileFormData.append("img_file", files[0]);
    setMediaFile(fileFormData);

    mutation.mutate();

    // TODO: Users can upload multiple files
    // files.forEach((file) => {
    //   fileFormData.append('img_file', file);
    // });
  }

  useEffect(() => {
    files.forEach((file) => {
      if (loadingState[file.name] === undefined) {
        generatePreview(file);
        simulateLoading(file);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center gap-x-4">
          <div className="w-fit rounded-md bg-pink-700/10 p-2">
            <ImageIcon className="h-10 w-10 text-pink-700" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Face Recognition</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Import your media files and let the app do the rest
            </p>
          </div>
        </div>
        <div className="mt-8 flex justify-between">
          <div className="flex w-full">
            <Input
              className="w-1/2 border-slate-100"
              placeholder="Search for images..."
            />
            <Button className="ml-4 font-semibold">
              <SearchIcon className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
          <Button
            className="font-semibold"
            onClick={() => setIsUploadMediaDialogOpen(true)}
          >
            <UploadIcon className="mr-2 h-4 w-4 text-white" />
            Upload Media Files
          </Button>
        </div>

        {/* Media Gallery */}
        <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-6">
          {mediaFilesQuery.data?.data?.image_urls.map((image_url: string) => {
            return (
              <Card key={image_url} className="overflow-hidden rounded-lg">
                <div className="relative aspect-square">
                  <img
                    src={image_url}
                    className="h-full w-full object-cover group-hover:opacity-75"
                  />
                </div>
              </Card>
            );
          })}

          {mediaFilesQuery.isLoading && <Loader />}
        </div>
      </div>

      {/* Upload Media Files */}
      <Dialog
        open={isUploadMediaDialogOpen}
        onOpenChange={setIsUploadMediaDialogOpen}
      >
        <DialogContent className="xl:max-w-[768px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary/90">
              Upload Media Files
            </DialogTitle>
          </DialogHeader>
          <div className="flex w-full flex-col items-center justify-center rounded-xl bg-white dark:border-slate-700 dark:bg-slate-800">
            <form className="w-full lg:w-[90%]">
              <Label
                htmlFor="file"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div
                  className={cn(
                    "m-2 flex h-52 flex-col items-center justify-center rounded-xl border-[1.5px] border-dashed border-primary/60 bg-primary/[0.02] py-2 hover:cursor-pointer",
                    dragOver && "border-blue-600 bg-blue-50"
                  )}
                >
                  <div className="flex flex-col items-center justify-start">
                    <UploadCloud
                      className={cn(
                        "my-4 h-5 w-5 text-slate-600",
                        dragOver && "text-blue-500"
                      )}
                    />
                    <p className="font-semibold text-primary">
                      Click to upload or drag & drop
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      JPEG, PNG, TIFF, WEBP, GIF
                    </p>
                  </div>
                </div>
              </Label>
              <Input
                id="file"
                type="file"
                name="file"
                // multiple
                className="hidden"
                onChange={handleChangeFile}
                accept="image/jpeg, image/png, image/tiff, image/bmp, image/webp, image/gif"
              />
            </form>

            {files.length > 0 && (
              <ScrollArea className="mt-6 flex max-h-80 w-full flex-col items-center justify-center gap-6 lg:w-[90%] xl:w-[90%]">
                {files.map((file, index) => {
                  const isLoading = loadingState[file.name];
                  const preview = imagePreviews[file.name];

                  return (
                    <div
                      key={index}
                      className="group flex flex-row items-center justify-between rounded-lg px-2 py-2 odd:bg-slate-400/5"
                    >
                      <div className="flex flex-row items-center justify-start gap-2">
                        {isLoading ? (
                          <div className="flex h-10 w-10 flex-row items-center justify-center gap-2 rounded-md border">
                            <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                          </div>
                        ) : (
                          preview && (
                            <div className="relative h-10 w-10">
                              <img
                                className="h-full w-full rounded-md border object-cover"
                                src={preview}
                                alt="Preview"
                              />
                            </div>
                          )
                        )}
                        <div className="flex flex-col items-start justify-start gap-1">
                          <p className="w-36 truncate text-sm text-slate-700 sm:w-56">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row items-center gap-2">
                        {!isLoading && (
                          <div className="flex flex-row items-center justify-between gap-1 rounded-full px-2 py-[0.5px] text-xs">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <p className="text-slate-500">Uploaded</p>
                          </div>
                        )}
                        <Button
                          className="px-3 opacity-90"
                          variant="destructive"
                          onClick={() => handleDelete(file.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </ScrollArea>
            )}
            {fileDropError && (
              <p className="text-sm text-red-400">{fileDropError}</p>
            )}
          </div>
          <div className="mt-2 space-y-2 sm:flex sm:justify-between sm:space-x-4 sm:space-y-0">
            <Button
              className="w-full font-semibold"
              onClick={handleUploadMediaFile}
              disabled={files.length > 0 ? false : true}
            >
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Upload
            </Button>
            <Button
              className="w-full sm:w-1/2"
              variant="secondary"
              onClick={() => setFiles([])}
              disabled={files.length > 0 ? false : true}
            >
              Remove all
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
