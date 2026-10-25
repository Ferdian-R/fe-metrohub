import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const CameraCapture = ({ onPhotoCaptured, currentPhoto }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCapturing(true);
    } catch (err) {
      setCameraError('Gagal mengakses kamera. Pastikan izin kamera telah diberikan dan gunakan HTTPS/localhost.');
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  useEffect(() => {
    if (!currentPhoto && !previewUrl) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, []);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    // Mirror horizontal for selfie camera feel
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Compress to JPEG with quality 0.7 to ensure < 500 KB (NF-07)
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCapturedBlob(blob);
          setPreviewUrl(url);
          stopCamera();
          if (onPhotoCaptured) {
            onPhotoCaptured(blob);
          }
        }
      },
      'image/jpeg',
      0.7
    );
  };

  const handleRetake = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setCapturedBlob(null);
    if (onPhotoCaptured) {
      onPhotoCaptured(null);
    }
    startCamera();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto bg-slate-900 rounded-2xl overflow-hidden shadow-lg p-3">
      <div className="relative w-full aspect-[4/3] bg-black rounded-xl overflow-hidden flex items-center justify-center">
        {cameraError ? (
          <div className="p-4 text-center text-rose-400 text-xs flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 text-rose-500" />
            <p>{cameraError}</p>
            <button
              type="button"
              onClick={startCamera}
              className="mt-2 px-3 py-1 bg-slate-800 text-white rounded text-xs flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Coba Lagi
            </button>
          </div>
        ) : previewUrl ? (
          <img src={previewUrl} alt="Hasil Foto Absensi" className="w-full h-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="mt-3 flex items-center justify-center gap-3 w-full">
        {previewUrl ? (
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 flex items-center gap-1.5 text-emerald-400 text-xs font-medium pl-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Foto berhasil diambil ({capturedBlob ? `${Math.round(capturedBlob.size / 1024)} KB` : ''})</span>
            </div>
            <button
              type="button"
              onClick={handleRetake}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Ambil Ulang
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={takePhoto}
            disabled={!isCapturing}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
          >
            <Camera className="w-4 h-4" /> Ambil Foto Wajah
          </button>
        )}
      </div>
    </div>
  );
};
