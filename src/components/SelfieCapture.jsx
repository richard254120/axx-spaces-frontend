import { useState, useRef, useEffect } from 'react';

const SelfieCapture = ({ onCapture, capturedImage, onRetake }) => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setStream(mediaStream);
      setError('');
    } catch (err) {
      setError('Unable to access camera. Please allow camera permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      setIsCapturing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      onCapture(imageData);
      stopCamera();
      setIsCapturing(false);
    }
  };

  if (capturedImage) {
    return (
      <div style={styles.container}>
        <label style={styles.label}>Selfie Verification</label>
        <div style={styles.previewContainer}>
          <img
            src={capturedImage}
            alt="Captured selfie"
            style={styles.capturedImage}
          />
          <button
            style={styles.retakeButton}
            onClick={onRetake}
          >
            🔄 Retake
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <label style={styles.label}>
        Selfie Verification
        <span style={styles.required}>*</span>
      </label>
      
      {!stream ? (
        <div style={styles.startCameraContainer}>
          <button
            style={styles.startCameraButton}
            onClick={startCamera}
          >
            <span style={styles.cameraIcon}>📷</span>
            <span style={styles.cameraText}>Start Camera</span>
          </button>
          {error && <div style={styles.error}>{error}</div>}
        </div>
      ) : (
        <div style={styles.cameraContainer}>
          <div style={styles.videoWrapper}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={styles.video}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  videoRef.current.play();
                }
              }}
            />
            <div style={styles.faceOverlay}>
              <div style={styles.faceGuide}>
                <div style={styles.faceGuideCornerTopLeft} />
                <div style={styles.faceGuideCornerTopRight} />
                <div style={styles.faceGuideCornerBottomLeft} />
                <div style={styles.faceGuideCornerBottomRight} />
              </div>
            </div>
          </div>
          
          <div style={styles.cameraControls}>
            <button
              style={styles.cancelButton}
              onClick={stopCamera}
            >
              ✕ Cancel
            </button>
            <button
              style={styles.captureButton}
              onClick={capturePhoto}
              disabled={isCapturing}
            >
              {isCapturing ? '⏳ Capturing...' : '📸 Capture'}
            </button>
          </div>
          
          <canvas ref={canvasRef} style={styles.hiddenCanvas} />
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: '8px',
  },
  required: {
    color: '#ef4444',
    marginLeft: '4px',
  },
  startCameraContainer: {
    textAlign: 'center',
    padding: '40px 20px',
    border: '2px dashed #334155',
    borderRadius: '12px',
    background: 'rgba(15, 23, 41, 0.5)',
  },
  startCameraButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 40px',
    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.08) 100%)',
    border: '2px solid rgba(251, 191, 36, 0.3)',
    borderRadius: '12px',
    color: '#fbbf24',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    margin: '0 auto',
  },
  cameraIcon: {
    fontSize: '48px',
  },
  cameraText: {
    fontSize: '14px',
  },
  cameraContainer: {
    border: '2px solid #334155',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#0f1729',
  },
  videoWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '640px',
    margin: '0 auto',
  },
  video: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  faceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  faceGuide: {
    width: '280px',
    height: '350px',
    position: 'relative',
    border: '2px solid rgba(251, 191, 36, 0.5)',
    borderRadius: '50%',
  },
  faceGuideCornerTopLeft: {
    position: 'absolute',
    top: '-4px',
    left: '-4px',
    width: '20px',
    height: '20px',
    borderTop: '4px solid #fbbf24',
    borderLeft: '4px solid #fbbf24',
    borderRadius: '4px 0 0 0',
  },
  faceGuideCornerTopRight: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    width: '20px',
    height: '20px',
    borderTop: '4px solid #fbbf24',
    borderRight: '4px solid #fbbf24',
    borderRadius: '0 4px 0 0',
  },
  faceGuideCornerBottomLeft: {
    position: 'absolute',
    bottom: '-4px',
    left: '-4px',
    width: '20px',
    height: '20px',
    borderBottom: '4px solid #fbbf24',
    borderLeft: '4px solid #fbbf24',
    borderRadius: '0 0 0 4px',
  },
  faceGuideCornerBottomRight: {
    position: 'absolute',
    bottom: '-4px',
    right: '-4px',
    width: '20px',
    height: '20px',
    borderBottom: '4px solid #fbbf24',
    borderRight: '4px solid #fbbf24',
    borderRadius: '0 0 4px 0',
  },
  cameraControls: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px',
    background: 'rgba(15, 23, 41, 0.9)',
  },
  cancelButton: {
    padding: '12px 24px',
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#fca5a5',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  captureButton: {
    padding: '12px 32px',
    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#0f1729',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  hiddenCanvas: {
    display: 'none',
  },
  previewContainer: {
    position: 'relative',
    maxWidth: '300px',
    margin: '0 auto',
  },
  capturedImage: {
    width: '100%',
    height: 'auto',
    borderRadius: '12px',
    border: '2px solid #334155',
  },
  retakeButton: {
    position: 'absolute',
    bottom: '-16px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '8px 20px',
    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.08) 100%)',
    border: '1px solid rgba(251, 191, 36, 0.3)',
    borderRadius: '20px',
    color: '#fbbf24',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  error: {
    marginTop: '12px',
    fontSize: '12px',
    color: '#ef4444',
  },
};

export default SelfieCapture;
