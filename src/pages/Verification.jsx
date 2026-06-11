import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DocumentUpload from '../components/DocumentUpload';
import SelfieCapture from '../components/SelfieCapture';

const Verification = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    // Level 2: Identity
    idType: '',
    idDocument: null,
    idDocumentPreview: null,
    idDocumentName: null,
    selfie: null,

    // Level 3: Address
    addressDocument: null,
    addressDocumentPreview: null,
    addressDocumentName: null,

    // Level 4: Business
    businessName: '',
    businessRegistration: null,
    businessRegistrationPreview: null,
    businessRegistrationName: null,
    taxId: '',
  });

  const steps = [
    { step: 1, title: 'Select Level', description: 'Choose your verification level' },
    { step: 2, title: 'Identity Verification', description: 'Upload ID and take selfie' },
    { step: 3, title: 'Address Verification', description: 'Upload proof of address' },
    { step: 4, title: 'Business Verification', description: 'Upload business documents' },
    { step: 5, title: 'Review & Submit', description: 'Review your information' },
  ];

  const levels = [
    { level: 2, name: 'Identity Verification', description: 'Verify your identity with ID and selfie', required: true },
    { level: 3, name: 'Address Verification', description: 'Verify your address with utility bill', required: false },
    { level: 4, name: 'Business Verification', description: 'Verify your business for premium features', required: false },
  ];

  const handleFileChange = (field, file, previewUrl) => {
    setFormData(prev => ({
      ...prev,
      [field]: file,
      [`${field}Preview`]: previewUrl,
      [`${field}Name`]: file ? file.name : null,
    }));
  };

  const handleRemoveFile = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: null,
      [`${field}Preview`]: null,
      [`${field}Name`]: null,
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://axx-spaces-backend-1.onrender.com/api';

      const formDataToSend = new FormData();
      formDataToSend.append('verificationLevel', selectedLevel);
      formDataToSend.append('idType', formData.idType);

      if (selectedLevel >= 4) {
        formDataToSend.append('businessName', formData.businessName);
        formDataToSend.append('taxId', formData.taxId);
      }

      if (formData.idDocument) {
        formDataToSend.append('idDocument', formData.idDocument);
      }
      if (formData.addressDocument && selectedLevel >= 3) {
        formDataToSend.append('addressDocument', formData.addressDocument);
      }
      if (formData.businessRegistration && selectedLevel >= 4) {
        formDataToSend.append('businessRegistration', formData.businessRegistration);
      }
      if (formData.selfie) {
        const base64Data = formData.selfie.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, { type: 'image/jpeg' });
        formDataToSend.append('selfie', blob, 'selfie.jpg');
      }

      const response = await fetch(`${API_BASE}/kyc-verification/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to submit verification');
      }

      setSuccess('Verification submitted successfully! You will be notified once reviewed.');
      setTimeout(() => {
        navigate('/settings');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return selectedLevel >= 2;
      case 2:
        return formData.idDocument && formData.selfie;
      case 3:
        return selectedLevel < 3 || formData.addressDocument;
      case 4:
        return selectedLevel < 4 || (formData.businessName && formData.businessRegistration && formData.taxId);
      case 5:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Select Verification Level</h2>
            <p style={styles.stepDescription}>Choose the level of verification you want to complete</p>

            <div style={styles.levelsContainer}>
              {levels.map((level) => (
                <div
                  key={level.level}
                  style={{
                    ...styles.levelCard,
                    ...(selectedLevel === level.level && styles.levelCardSelected),
                  }}
                  onClick={() => setSelectedLevel(level.level)}
                >
                  <div style={styles.levelHeader}>
                    <div style={styles.levelNumber}>Level {level.level}</div>
                    {level.required && <span style={styles.requiredBadge}>Required</span>}
                  </div>
                  <h3 style={styles.levelName}>{level.name}</h3>
                  <p style={styles.levelDescription}>{level.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Identity Verification</h2>
            <p style={styles.stepDescription}>Upload your government ID and take a selfie</p>

            <div style={styles.formSection}>
              <label style={styles.formLabel}>ID Type</label>
              <select
                style={styles.select}
                value={formData.idType}
                onChange={(e) => setFormData(prev => ({ ...prev, idType: e.target.value }))}
              >
                <option value="">Select ID Type</option>
                <option value="national_id">National ID</option>
                <option value="passport">Passport</option>
                <option value="driver_license">Driver's License</option>
              </select>

              <DocumentUpload
                label="Government ID Document"
                onFileChange={(file, previewUrl) => handleFileChange('idDocument', file, previewUrl)}
                previewUrl={formData.idDocumentPreview}
                fileName={formData.idDocumentName}
                onRemove={() => handleRemoveFile('idDocument')}
                required
              />

              <SelfieCapture
                onCapture={(image) => setFormData(prev => ({ ...prev, selfie: image }))}
                capturedImage={formData.selfie}
                onRetake={() => setFormData(prev => ({ ...prev, selfie: null }))}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Address Verification</h2>
            <p style={styles.stepDescription}>Upload a proof of address document</p>

            <div style={styles.formSection}>
              <DocumentUpload
                label="Proof of Address (Utility Bill, Bank Statement)"
                onFileChange={(file, previewUrl) => handleFileChange('addressDocument', file, previewUrl)}
                previewUrl={formData.addressDocumentPreview}
                fileName={formData.addressDocumentName}
                onRemove={() => handleRemoveFile('addressDocument')}
                required={selectedLevel >= 3}
              />

              <div style={styles.infoBox}>
                <span style={styles.infoIcon}>ℹ️</span>
                <span style={styles.infoText}>
                  Accepted documents: Utility bills, bank statements, or government letters
                  issued within the last 3 months.
                </span>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Business Verification</h2>
            <p style={styles.stepDescription}>Upload your business documents</p>

            <div style={styles.formSection}>
              <label style={styles.formLabel}>Business Name</label>
              <input
                type="text"
                style={styles.input}
                placeholder="Enter your business name"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                required={selectedLevel >= 4}
              />

              <label style={styles.formLabel}>Tax Identification Number</label>
              <input
                type="text"
                style={styles.input}
                placeholder="Enter your tax ID"
                value={formData.taxId}
                onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                required={selectedLevel >= 4}
              />

              <DocumentUpload
                label="Business Registration Certificate"
                onFileChange={(file, previewUrl) => handleFileChange('businessRegistration', file, previewUrl)}
                previewUrl={formData.businessRegistrationPreview}
                fileName={formData.businessRegistrationName}
                onRemove={() => handleRemoveFile('businessRegistration')}
                acceptedTypes="image/*,.pdf"
                required={selectedLevel >= 4}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Review & Submit</h2>
            <p style={styles.stepDescription}>Review your information before submitting</p>

            {error && <div style={styles.errorBox}>{error}</div>}
            {success && <div style={styles.successBox}>{success}</div>}

            <div style={styles.reviewSection}>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Verification Level:</span>
                <span style={styles.reviewValue}>Level {selectedLevel}</span>
              </div>

              {formData.idType && (
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>ID Type:</span>
                  <span style={styles.reviewValue}>{formData.idType.replace('_', ' ')}</span>
                </div>
              )}

              {formData.idDocument && (
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>ID Document:</span>
                  <span style={styles.reviewValue}>✓ {formData.idDocumentName}</span>
                </div>
              )}

              {formData.selfie && (
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Selfie:</span>
                  <span style={styles.reviewValue}>✓ Captured</span>
                </div>
              )}

              {formData.addressDocument && (
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Address Document:</span>
                  <span style={styles.reviewValue}>✓ {formData.addressDocumentName}</span>
                </div>
              )}

              {formData.businessName && (
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Business Name:</span>
                  <span style={styles.reviewValue}>{formData.businessName}</span>
                </div>
              )}

              {formData.taxId && (
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Tax ID:</span>
                  <span style={styles.reviewValue}>{formData.taxId}</span>
                </div>
              )}

              {formData.businessRegistration && (
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Business Registration:</span>
                  <span style={styles.reviewValue}>✓ {formData.businessRegistrationName}</span>
                </div>
              )}
            </div>

            <div style={styles.termsBox}>
              <input type="checkbox" id="terms" style={styles.checkbox} />
              <label htmlFor="terms" style={styles.termsLabel}>
                I confirm that all information provided is accurate and I agree to the terms and conditions
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wizard}>
        {/* Step Indicator */}
        <div style={styles.stepIndicator}>
          {steps.map((step) => (
            <div
              key={step.step}
              style={{
                ...styles.stepIndicatorItem,
                ...(step.step === currentStep && styles.stepIndicatorItemActive),
                ...(step.step < currentStep && styles.stepIndicatorItemCompleted),
              }}
            >
              <div style={{
                ...styles.stepNumber,
                ...(step.step === currentStep && styles.stepNumberActive),
                ...(step.step < currentStep && styles.stepNumberCompleted),
              }}>
                {step.step < currentStep ? '✓' : step.step}
              </div>
              <div style={styles.stepInfo}>
                <div style={styles.stepIndicatorTitle}>{step.title}</div>
                <div style={styles.stepIndicatorDescription}>{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div style={styles.content}>
          {renderStep()}
        </div>

        {/* Navigation */}
        <div style={styles.navigation}>
          <button
            style={{
              ...styles.backButton,
              ...(currentStep === 1 && styles.backButtonDisabled),
            }}
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            ← Back
          </button>

          {currentStep < steps.length ? (
            <button
              style={{
                ...styles.nextButton,
                ...(!isStepValid() && styles.nextButtonDisabled),
              }}
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              Next →
            </button>
          ) : (
            <button
              style={{
                ...styles.submitButton,
                ...(loading && styles.nextButtonDisabled),
              }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Verification'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f1729 0%, #1e293b 100%)',
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  wizard: {
    width: '100%',
    maxWidth: '800px',
    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 41, 0.95) 100%)',
    border: '1px solid #334155',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  stepIndicator: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '32px',
  },
  stepIndicatorItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    borderRadius: '12px',
    background: 'rgba(15, 23, 41, 0.5)',
    border: '1px solid #334155',
    opacity: 0.5,
  },
  stepIndicatorItemActive: {
    opacity: 1,
    borderColor: '#fbbf24',
    background: 'rgba(251, 191, 36, 0.1)',
  },
  stepIndicatorItemCompleted: {
    opacity: 1,
    borderColor: '#22c55e',
    background: 'rgba(34, 197, 94, 0.1)',
  },
  stepNumber: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '700',
    color: '#f1f5f9',
    flexShrink: 0,
  },
  stepNumberActive: {
    background: '#fbbf24',
    color: '#0f1729',
  },
  stepNumberCompleted: {
    background: '#22c55e',
    color: '#0f1729',
  },
  stepInfo: {
    flex: 1,
  },
  stepIndicatorTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: '4px',
  },
  stepIndicatorDescription: {
    fontSize: '12px',
    color: '#64748b',
  },
  content: {
    marginBottom: '32px',
  },
  stepContent: {
    animation: 'fadeIn 0.3s ease',
  },
  stepTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#f1f5f9',
    margin: '0 0 8px 0',
  },
  stepDescription: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '24px',
  },
  levelsContainer: {
    display: 'grid',
    gap: '16px',
  },
  levelCard: {
    padding: '20px',
    borderRadius: '12px',
    border: '2px solid #334155',
    background: 'rgba(15, 23, 41, 0.5)',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  levelCardSelected: {
    borderColor: '#fbbf24',
    background: 'rgba(251, 191, 36, 0.1)',
  },
  levelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  levelNumber: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#fbbf24',
  },
  requiredBadge: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#22c55e',
    background: 'rgba(34, 197, 94, 0.2)',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  levelName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#f1f5f9',
    margin: '0 0 8px 0',
  },
  levelDescription: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: '8px',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(15, 23, 41, 0.5)',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(15, 23, 41, 0.5)',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  infoBox: {
    display: 'flex',
    gap: '12px',
    padding: '12px 16px',
    background: 'rgba(251, 191, 36, 0.1)',
    border: '1px solid rgba(251, 191, 36, 0.3)',
    borderRadius: '8px',
  },
  infoIcon: {
    fontSize: '16px',
  },
  infoText: {
    fontSize: '13px',
    color: '#fbbf24',
    flex: 1,
  },
  errorBox: {
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#f87171',
    fontSize: '14px',
    marginBottom: '16px',
  },
  successBox: {
    padding: '12px 16px',
    background: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '8px',
    color: '#4ade80',
    fontSize: '14px',
    marginBottom: '16px',
  },
  reviewSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '20px',
    background: 'rgba(15, 23, 41, 0.5)',
    borderRadius: '12px',
    border: '1px solid #334155',
  },
  reviewItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #1e293b',
  },
  reviewLabel: {
    fontSize: '14px',
    color: '#64748b',
  },
  reviewValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f1f5f9',
  },
  termsBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginTop: '20px',
    padding: '16px',
    background: 'rgba(15, 23, 41, 0.5)',
    borderRadius: '8px',
    border: '1px solid #334155',
  },
  checkbox: {
    marginTop: '4px',
    cursor: 'pointer',
  },
  termsLabel: {
    fontSize: '13px',
    color: '#64748b',
    cursor: 'pointer',
    lineHeight: '1.5',
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
  },
  backButton: {
    padding: '12px 32px',
    background: 'rgba(15, 23, 41, 0.5)',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#f1f5f9',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  backButtonDisabled: {
    opacity: 0.3,
    cursor: 'not-allowed',
  },
  nextButton: {
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
  nextButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  submitButton: {
    padding: '12px 32px',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#0f1729',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default Verification;