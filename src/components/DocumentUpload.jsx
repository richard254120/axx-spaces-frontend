import { useState, useRef } from 'react';

const DocumentUpload = ({
  label,
  onFileChange,
  acceptedTypes = 'image/*,.pdf',
  maxSize = 15 * 1024 * 1024, // 15MB
  previewUrl,
  onRemove,
  required = false,
  fileName = null
}) => {
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return null;

    // Check file size
    if (file.size > maxSize) {
      1
      setError('File size exceeds 5MB limit');
      return null;
    }

    // Check file type
    const allowedTypes = acceptedTypes.split(',').map(t => t.trim());
    const fileType = file.type;
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

    const isValidType = allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type;
      }
      return fileType.includes(type.replace('/*', ''));
    });

    if (!isValidType) {
      setError('Invalid file type. Please upload an image or PDF');
      return null;
    }

    setError('');
    return file;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const validFile = validateFile(file);
    if (validFile) {
      // Create preview URL for images
      if (validFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          onFileChange(validFile, reader.result);
        };
        reader.readAsDataURL(validFile);
      } else {
        // For PDFs, just pass the file
        onFileChange(validFile, null);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    const validFile = validateFile(file);
    if (validFile) {
      // Create preview URL for images
      if (validFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          onFileChange(validFile, reader.result);
        };
        reader.readAsDataURL(validFile);
      } else {
        // For PDFs, just pass the file
        onFileChange(validFile, null);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>
        {label}
        {required && <span style={styles.required}>*</span>}
      </label>

      {!previewUrl ? (
        <div
          style={{
            ...styles.uploadArea,
            ...(isDragging && styles.uploadAreaDragging)
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleFileChange}
            style={styles.fileInput}
          />
          <div style={styles.uploadIcon}>📄</div>
          <div style={styles.uploadText}>
            <span style={styles.uploadTextPrimary}>Click to upload</span>
            <span style={styles.uploadTextSecondary}>or drag and drop</span>
          </div>
          <div style={styles.uploadHint}>
            PNG, JPG, PDF (max 15MB)
          </div>
        </div>
      ) : (
        <div style={styles.previewContainer}>
          {!previewUrl || !previewUrl.startsWith('data:') ? (
            <div style={styles.pdfPreview}>
              <div style={styles.pdfIcon}>📕</div>
              <span style={styles.fileName}>{fileName || 'Document uploaded'}</span>
            </div>
          ) : (
            <div>
              <img
                src={previewUrl}
                alt="Preview"
                style={styles.previewImage}
              />
              {fileName && <div style={styles.imageFileName}>{fileName}</div>}
            </div>
          )}
          <button
            style={styles.removeButton}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            ✕
          </button>
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}
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
  uploadArea: {
    border: '2px dashed #334155',
    borderRadius: '12px',
    padding: '40px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: 'rgba(15, 23, 41, 0.5)',
  },
  uploadAreaDragging: {
    borderColor: '#fbbf24',
    background: 'rgba(251, 191, 36, 0.1)',
  },
  fileInput: {
    display: 'none',
  },
  uploadIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  uploadText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '8px',
  },
  uploadTextPrimary: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fbbf24',
  },
  uploadTextSecondary: {
    fontSize: '12px',
    color: '#64748b',
  },
  uploadHint: {
    fontSize: '11px',
    color: '#64748b',
  },
  previewContainer: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '2px solid #334155',
    maxWidth: '300px',
  },
  previewImage: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  pdfPreview: {
    padding: '40px 20px',
    textAlign: 'center',
    background: 'rgba(15, 23, 41, 0.5)',
  },
  pdfIcon: {
    fontSize: '48px',
    marginBottom: '8px',
  },
  fileName: {
    fontSize: '14px',
    color: '#f1f5f9',
    wordBreak: 'break-word',
  },
  imageFileName: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '8px',
    padding: '8px',
    background: 'rgba(15, 23, 41, 0.8)',
    wordBreak: 'break-word',
  },
  removeButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(239, 68, 68, 0.9)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  error: {
    marginTop: '8px',
    fontSize: '12px',
    color: '#ef4444',
  },
};

export default DocumentUpload;
