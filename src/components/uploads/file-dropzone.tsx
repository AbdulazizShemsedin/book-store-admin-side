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
  onUploaded: (result: UploadResult) => void;
  required?: boolean;
}

export function FileDropzone({
  label,
  accept,
  maxSizeMB = 500,
  iconType = 'file',
  helperText,
  onUploaded,
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
    [onUploaded]
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
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {selectedFile && status !== 'uploading' && (
          <span className="text-[11px] text-slate-500 font-mono">
            {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
          </span>
        )}
      </div>

      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed transition-all text-center select-none',
          isDragActive
            ? 'border-emerald-700 bg-emerald-50/40'
            : 'border-slate-200 bg-[#f8fafc] hover:bg-slate-50/80 hover:border-slate-300',
          status === 'error' && 'border-red-300 bg-red-50/20',
          status === 'success' && 'border-emerald-400 bg-emerald-50/30'
        )}
      >
        <input {...getInputProps()} />

        {/* IDLE STATE */}
        {status === 'idle' && (
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100/60 text-[#1e4634] flex items-center justify-center mx-auto shadow-sm">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">
                {isDragActive ? 'Drop file here' : 'Click to browse or drop file'}
              </p>
              {helperText && <p className="text-[11px] text-slate-500 mt-1">{helperText}</p>}
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
              <span className="font-medium text-slate-800 truncate max-w-[200px]">
                {selectedFile?.name}
              </span>
              <span className="font-mono text-emerald-800 font-semibold">{progress}%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1e4634] transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Streaming direct to cloud storage...</span>
              <button
                type="button"
                onClick={cancelUpload}
                className="text-red-600 hover:underline flex items-center gap-0.5"
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
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" weight="fill" />
            </div>
            <p className="text-xs font-semibold text-slate-800 truncate max-w-xs">
              {selectedFile?.name}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium">
              Upload completed & verified
            </p>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={open}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Replace File
            </Button>
          </div>
        )}

        {/* ERROR STATE */}
        {status === 'error' && (
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <WarningCircle className="w-6 h-6" weight="fill" />
            </div>
            <p className="text-xs font-semibold text-red-700">{errorMessage}</p>
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
