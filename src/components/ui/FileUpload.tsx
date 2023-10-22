"use client";
import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2 } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  // Mutations are typically used to create/update/delete data or perform side-effects
  const { mutate, isLoading } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });

  // We pass these two props to make it so that we can drag and drop files into the input field.
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        // Bigger than 10MB
        toast.error("File is too big. Please upload a file smaller than 10MB.");
        return;
      }

      try {
        setUploading(true);
        const data = await uploadToS3(file);
        if (!data?.file_key || !data?.file_name) {
          toast.error("Error uploading file to S3.");
          return;
        }
        mutate(data, {
          onSuccess: ({chat_id}) => {
            toast.success("Chat created!");

            // Redirect to chat page
            router.push(`/chat/${chat_id}`);
          },
          onError: (error) => {
            toast.error("Error creating chat." + error);
            console.error(error);
          },
        });
        console.log("data", data);
      } catch (error) {
        console.log(error);
      } finally {
        setUploading(false);
      }
    },
  });
  return (
    <div className="p-2 bg-white rounded-xl dark:bg-black">
      {/* This is the div that we are going to be dragging and dropping files into. */}
      {/* React dropzone docs say that to add props that are to be applied to the element, pass them through the getRootProps function to prevent them from being overridden  */}
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col dark:bg-black dark:border-white",
        })}
      >
        <input {...getInputProps()} />
        {/* uploading is true while uploading to S3, and isLoading is true while file_key and file_name are being sent to back-end */}
        {uploading || isLoading ? (
          <>
          {/* loading state */}
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="mt-2 text-sm text-slate-400">Talking to GPT...</p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm-text-slate-400">Drop PDF Here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
