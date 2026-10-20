'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import {
  UploadSimple,
  FileText,
  Headphones,
  CheckCircle,
  WarningCircle,
  X,
  ArrowClockwise,
} from '@phosphor-icons/react';
import { uploadFileDirectMultipart, UploadResult } from '@/lib/upload/multipart-upload';

export interface FileDropzoneProps {
  label: string;
  accept: Record<string, string[]>;
  maxSizeMB?: number;
  iconType?: 'file' | 'audio' | 'image';
  helperText?: string;
  onUploaded?: (result: UploadResult) => void;
  onFileSelected?: (file: File | null) => void;
  required?: boolean;
}

export function FileDropzone({
  label,
  accept,
  maxSizeMB = 500,
  iconType = 'file',
  helperText,
  onUploaded,
  onFileSelected,
  required,
}: FileDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startUpload = useCallback(
    async (file: File) => {
      setSelectedFile(file);
      onFileSelected?.(file);

      // If no onUploaded callback was provided, file is staged locally for form submission
      if (!onUploaded) {
        setStatus('success');
        return;
      }

      setStatus('uploading');
      setProgress(0);
      setErrorMessage(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const result = await uploadFileDirectMultipart(file, {
          signal: controller.signal,
          onProgress: (pct) => setProgress(pct),
        });

        setStatus('success');
        setProgress(100);
        onUploaded(result);
      } catch (err) {
        if (controller.signal.aborted) {
          setStatus('idle');
          setSelectedFile(null);
          return;
        }
        setStatus('error');
        setErrorMessage(
          err instanceof Error ? err.message : 'File upload failed. Please try again.'
        );
      }
    },
    [onUploaded, onFileSelected]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: unknown[]) => {
      if (fileRejections.length > 0) {
        setStatus('error');
        setErrorMessage(`File exceeds the maximum allowed size of ${maxSizeMB}MB or has invalid format.`);
        return;
      }

      if (acceptedFiles.length > 0) {
        startUpload(acceptedFiles[0]);
      }
    },
    [maxSizeMB, startUpload]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: false,
    noClick: status === 'uploading' || status === 'success',
  });

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus('idle');
    setSelectedFile(null);
    setProgress(0);
  };

  const IconComponent =
    iconType === 'audio' ? Headphones : iconType === 'image' ? UploadSimple : FileText;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {selectedFile && status !== 'uploading' && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
          </span>
        )}
      </div>

      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed transition-all text-center select-none',
          isDragActive
            ? 'border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/40 dark:border-emerald-500'
            : 'border-slate-200 dark:border-slate-800 bg-[#f8fafc] dark:bg-[#070a10] hover:bg-slate-50/80 dark:hover:bg-[#0d121d] hover:border-slate-300 dark:hover:border-slate-700',
          status === 'error' && 'border-red-300 dark:border-red-800 bg-red-50/20 dark:bg-red-950/20',
          status === 'success' && 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/30'
        )}
      >
        <input {...getInputProps()} />

        {/* IDLE STATE */}
        {status === 'idle' && (
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100/60 dark:bg-emerald-950/60 text-[#1e4634] dark:text-emerald-300 flex items-center justify-center mx-auto shadow-sm">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {isDragActive ? 'Drop file here' : 'Click to browse or drop file'}
              </p>
              {helperText && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>}
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={open}
              className="text-xs"
            >
              Browse Computer
            </Button>
          </div>
        )}

        {/* UPLOADING STATE */}
        {status === 'uploading' && (
          <div className="w-full space-y-3 px-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                {selectedFile?.name}
              </span>
              <span className="font-mono text-emerald-800 dark:text-emerald-400 font-semibold">{progress}%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1e4634] dark:bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Streaming direct to cloud storage...</span>
              <button
                type="button"
                onClick={cancelUpload}
                className="text-red-600 dark:text-red-400 hover:underline flex items-center gap-0.5"
              >
                <X className="w-3 h-3" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" weight="fill" />
            </div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
              {selectedFile?.name}
            </p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              {onUploaded ? 'Upload completed & verified' : 'File selected & ready for upload'}
            </p>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={open}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Replace File
            </Button>
          </div>
        )}

        {/* ERROR STATE */}
        {status === 'error' && (
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <WarningCircle className="w-6 h-6" weight="fill" />
            </div>
            <p className="text-xs font-semibold text-red-700 dark:text-red-400">{errorMessage}</p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              leftIcon={<ArrowClockwise className="w-3.5 h-3.5" />}
              onClick={() => selectedFile && startUpload(selectedFile)}
            >
              Retry Upload
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
