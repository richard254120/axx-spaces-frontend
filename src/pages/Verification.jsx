import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getDashboardPath } from '../utils/dashboardRoutes';
import DocumentUpload from '../components/DocumentUpload';
import SelfieCapture from '../components/SelfieCapture';

const Verification = () => {
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    // Level 1: Student
    studentIdDocument: null,
    studentIdDocumentPreview: null,
    studentIdDocumentName: null,

    // Level 2: Standard (Identity & Address)
    idType: '',
    idDocument: null,
    idDocumentPreview: null,
    idDocumentName: null,
    selfie: null,
    addressDocument: null,
    addressDocumentPreview: null,
    addressDocumentName: null,

    // Level 3: Premium (Physical Verification)
    physicalDetails: '',
  });

  const levels = [
    {
      level: 1,
      name: 'Student Verification',
      description: 'Upload your Student ID to verify enrollment. Grants the academic Student Badge.',
      badge: '🎓 Student Badge',
      color: '#3b82f6'
    },
    {
      level: 2,
      name: 'Standard Verification',
      description: 'Upload ID document, Proof of Address (utility bill), and Selfie to get verified.',
      badge: '✓ Verified Standard Badge',
      color: '#10b981'
    },
    {
      level: 3,
      name: 'Premium Verification',
      description: 'Request physical, in-person verification by AxxSpace staff at your location.',
      badge: '👑 Premium Verified Gold Badge',
      color: '#f59e0b'
    }
  ];

  // Dynamically generate wizard steps based on the selected verification level
  const getSteps = () => {
    if (selectedLevel === 1) {
      return [
        { step: 1, title: 'Select Level', description: 'Choose verification path' },
        { step: 2, title: 'Student ID Upload', description: 'Upload student card' },
        { step: 3, title: 'Review & Submit', description: 'Confirm your details' },
      ];
    } else if (selectedLevel === 2) {
      return [
        { step: 1, title: 'Select Level', description: 'Choose verification path' },
        { step: 2, title: 'Identity Documents', description: 'Upload ID & Selfie' },
        { step: 3, title: 'Address Verification', description: 'Upload utility bill' },
        { step: 4, title: 'Review & Submit', description: 'Confirm your details' },
      ];
    } else {
      return [
        { step: 1, title: 'Select Level', description: 'Choose verification path' },
        { step: 2, title: 'Physical Details', description: 'Location & appointment info' },
        { step: 3, title: 'Review & Submit', description: 'Confirm your details' },
      ];
    }
  };

  const steps = getSteps();

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
    if (currentStep < steps.length) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    setCurrentStep(1); // Reset step back to 1
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://axx-spaces-backend-1.onrender.com/api';
      const formDataToSend = new FormData();
      formDataToSend.append('verificationLevel', selectedLevel);

      if (selectedLevel === 1) {
        if (formData.studentIdDocument) {
          formDataToSend.append('studentIdDocument', formData.studentIdDocument);
        }
      } else if (selectedLevel === 2) {
        formDataToSend.append('idType', formData.idType);
        if (formData.idDocument) {
          formDataToSend.append('idDocument', formData.idDocument);
        }
        if (formData.addressDocument) {
          formDataToSend.append('addressDocument', formData.addressDocument);
        }
        // Selfie base64 data conversion
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
            byteArrays.push(new Uint8Array(byteNumbers));
          }
          const blob = new Blob(byteArrays, { type: 'image/jpeg' });
          formDataToSend.append('selfie', blob, 'selfie.jpg');
        }
      } else if (selectedLevel === 3) {
        formDataToSend.append('physicalDetails', formData.physicalDetails);
      }

      const response = await fetch(`${API_BASE}/kyc-verification/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to submit verification');
      }

      setSuccess('Verification submitted successfully! You will be notified once reviewed.');

      const userRole = user?.role || user?.userType || "user";
      setTimeout(() => navigate(getDashboardPath(userRole)), 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    const activeSteps = getSteps();
    const currentStepConfig = activeSteps[currentStep - 1];

    if (currentStep === 1) return selectedLevel >= 1;

    // Student Flow
    if (selectedLevel === 1) {
      if (currentStep === 2) return formData.studentIdDocument !== null;
      return true; // Review step
    }

    // Standard Flow
    if (selectedLevel === 2) {
      if (currentStep === 2) return formData.idType !== '' && formData.idDocument !== null && formData.selfie !== null;
      if (currentStep === 3) return formData.addressDocument !== null;
      return true; // Review step
    }

    // Premium Flow
    if (selectedLevel === 3) {
      if (currentStep === 2) return formData.physicalDetails.trim().length > 15;
      return true; // Review step
    }

    return false;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Select Verification Path</h2>
            <p style={styles.stepDescription}>Choose the tier that matches your verification needs</p>
            <div style={styles.levelsContainer}>
              {levels.map((lvl) => (
                <div
                  key={lvl.level}
                  style={{
                    ...styles.levelCard,
                    ...(selectedLevel === lvl.level && {
                      borderColor: lvl.color,
                      background: `${lvl.color}15`,
                    }),
                  }}
                  onClick={() => handleLevelChange(lvl.level)}
                >
                  <div style={styles.levelHeader}>
                    <div style={{ ...styles.levelNumber, color: lvl.color }}>Level {lvl.level}</div>
                    <span style={{ ...styles.badgePill, backgroundColor: `${lvl.color}25`, color: lvl.color }}>
                      {lvl.badge}
                    </span>
                  </div>
                  <h3 style={styles.levelName}>{lvl.name}</h3>
                  <p style={styles.levelDescription}>{lvl.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        if (selectedLevel === 1) {
          return (
            <div style={styles.stepContent}>
              <h2 style={styles.stepTitle}>Student Verification</h2>
              <p style={styles.stepDescription}>Upload a valid Student ID Card issued by an accredited institution</p>
              <div style={styles.formSection}>
                <DocumentUpload
                  label="Student ID (Image or PDF)"
                  onFileChange={(file, previewUrl) => handleFileChange('studentIdDocument', file, previewUrl)}
                  previewUrl={formData.studentIdDocumentPreview}
                  fileName={formData.studentIdDocumentName}
                  onRemove={() => handleRemoveFile('studentIdDocument')}
                  required
                />
                <div style={styles.infoBox}>
                  <span style={styles.infoIcon}>💡</span>
                  <span style={styles.infoText}>
                    Please ensure the ID clearly shows your name, institution name, student number, and expiry date.
                  </span>
                </div>
              </div>
            </div>
          );
        } else if (selectedLevel === 2) {
          return (
            <div style={styles.stepContent}>
              <h2 style={styles.stepTitle}>Identity Verification</h2>
              <p style={styles.stepDescription}>Upload your Government-issued ID card or Passport and capture a live selfie</p>
              <div style={styles.formSection}>
                <div>
                  <label style={styles.formLabel}>ID Document Type</label>
                  <select
                    style={styles.select}
                    value={formData.idType}
                    onChange={(e) => setFormData(prev => ({ ...prev, idType: e.target.value }))}
                  >
                    <option value="">-- Choose Document Type --</option>
                    <option value="national_id">National Identification Card</option>
                    <option value="passport">Passport</option>
                    <option value="driver_license">Driver's License</option>
                  </select>
                </div>

                <DocumentUpload
                  label="Front / Photo Page of ID Document"
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
        } else {
          // Level 3: Premium Request
          return (
            <div style={styles.stepContent}>
              <h2 style={styles.stepTitle}>Request Physical Verification</h2>
              <p style={styles.stepDescription}>
                Provide your primary physical address, preferred visitation date/time, and cell number to schedule a check
              </p>
              <div style={styles.formSection}>
                <div>
                  <label style={styles.formLabel}>Physical Address & Scheduling Notes (min 15 characters)</label>
                  <textarea
                    style={styles.textarea}
                    placeholder="e.g. Ruiru, Kiambu County - Oak Apartments, Rm 4B. Available Mon-Fri 9AM to 4PM. Phone: 0712345678"
                    value={formData.physicalDetails}
                    onChange={(e) => setFormData(prev => ({ ...prev, physicalDetails: e.target.value }))}
                    rows={6}
                  />
                </div>
                <div style={styles.infoBoxGold}>
                  <span style={styles.infoIcon}>👑</span>
                  <span style={styles.infoTextGold}>
                    Premium verification involves a quick on-site physical check by an authorized AxxSpace representative. Once completed, your profile will display the exclusive Premium Gold Badge.
                  </span>
                </div>
              </div>
            </div>
          );
        }

      case 3:
        if (selectedLevel === 2) {
          // Standard Level Address Proof
          return (
            <div style={styles.stepContent}>
              <h2 style={styles.stepTitle}>Address Verification</h2>
              <p style={styles.stepDescription}>Upload a utility bill or bank statement as proof of address</p>
              <div style={styles.formSection}>
                <DocumentUpload
                  label="Utility Bill, Rent Invoice, or Bank Statement (issued within 3 months)"
                  onFileChange={(file, previewUrl) => handleFileChange('addressDocument', file, previewUrl)}
                  previewUrl={formData.addressDocumentPreview}
                  fileName={formData.addressDocumentName}
                  onRemove={() => handleRemoveFile('addressDocument')}
                  required
                />
                <div style={styles.infoBox}>
                  <span style={styles.infoIcon}>ℹ️</span>
                  <span style={styles.infoText}>
                    Document must display your full name and matching address.
                  </span>
                </div>
              </div>
            </div>
          );
        } else {
          // Level 1 and 3 Review step
          return renderReviewStep();
        }

      case 4:
        if (selectedLevel === 2) {
          // Level 2 Review step
          return renderReviewStep();
        }
        return null;

      default:
        return null;
    }
  };

  const renderReviewStep = () => {
    const activeLevelObj = levels.find(l => l.level === selectedLevel);
    return (
      <div style={styles.stepContent}>
        <h2 style={styles.stepTitle}>Review & Submit Details</h2>
        <p style={styles.stepDescription}>Please verify all fields before submitting your application</p>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <div style={styles.reviewSection}>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>Chosen Verification path</span>
            <span style={{ ...styles.reviewValue, color: activeLevelObj?.color }}>
              Level {selectedLevel}: {activeLevelObj?.name}
            </span>
          </div>

          {selectedLevel === 1 && (
            <div style={styles.reviewItem}>
              <span style={styles.reviewLabel}>Student ID Document</span>
              <span style={styles.reviewValueGreen}>✓ {formData.studentIdDocumentName}</span>
            </div>
          )}

          {selectedLevel === 2 && (
            <>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>ID Type</span>
                <span style={styles.reviewValue}>{formData.idType?.toUpperCase().replace(/_/g, ' ')}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Government ID Photo</span>
                <span style={styles.reviewValueGreen}>✓ {formData.idDocumentName}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Biometric Selfie</span>
                <span style={styles.reviewValueGreen}>✓ Selfie Captured</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Proof of Address Document</span>
                <span style={styles.reviewValueGreen}>✓ {formData.addressDocumentName}</span>
              </div>
            </>
          )}

          {selectedLevel === 3 && (
            <div style={{ ...styles.reviewItem, flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              <span style={styles.reviewLabel}>Physical Appointment & Address details</span>
              <p style={styles.reviewParagraph}>{formData.physicalDetails}</p>
            </div>
          )}
        </div>

        <div style={styles.termsBox}>
          <input type="checkbox" id="termsConfirm" style={styles.checkbox} />
          <label htmlFor="termsConfirm" style={styles.termsLabel}>
            I confirm that the details provided are correct and authorize AxxSpace to evaluate my credentials.
          </label>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.wizard}>
        {/* Step Indicator */}
        <div style={styles.stepIndicator}>
          {steps.map((st) => (
            <div
              key={st.step}
              style={{
                ...styles.stepIndicatorItem,
                ...(st.step === currentStep && styles.stepIndicatorItemActive),
                ...(st.step < currentStep && styles.stepIndicatorItemCompleted),
              }}
            >
              <div style={{
                ...styles.stepNumber,
                ...(st.step === currentStep && styles.stepNumberActive),
                ...(st.step < currentStep && styles.stepNumberCompleted),
              }}>
                {st.step < currentStep ? '✓' : st.step}
              </div>
              <div style={styles.stepInfo}>
                <div style={styles.stepIndicatorTitle}>{st.title}</div>
                <div style={styles.stepIndicatorDescription}>{st.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div style={styles.content}>
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div style={styles.navigation}>
          <button
            style={{ ...styles.backButton, ...(currentStep === 1 && styles.disabledBtn) }}
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            ← Back
          </button>

          {currentStep < steps.length ? (
            <button
              style={{ ...styles.nextButton, ...(!isStepValid() && styles.disabledBtn) }}
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              Next →
            </button>
          ) : (
            <button
              style={{ ...styles.submitButton, ...((loading || !isStepValid()) && styles.disabledBtn) }}
              onClick={handleSubmit}
              disabled={loading || !isStepValid()}
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
    background: 'linear-gradient(135deg, #090e1a 0%, #151c2c 100%)',
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    fontFamily: "'DM Sans', sans-serif",
  },
  wizard: {
    width: '100%',
    maxWidth: '850px',
    background: 'linear-gradient(135deg, rgba(20, 27, 45, 0.9) 0%, rgba(10, 15, 28, 0.98) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '36px',
    boxShadow: '0 25px 65px rgba(0, 0, 0, 0.4)',
  },
  stepIndicator: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    marginBottom: '36px',
  },
  stepIndicatorItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    opacity: 0.4,
    transition: 'all 0.25s',
  },
  stepIndicatorItemActive: {
    opacity: 1,
    borderColor: '#c9a84c',
    background: 'rgba(201, 168, 76, 0.06)',
  },
  stepIndicatorItemCompleted: {
    opacity: 1,
    borderColor: '#10b981',
    background: 'rgba(16, 185, 129, 0.06)',
  },
  stepNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    color: '#cbd5e1',
    flexShrink: 0,
    transition: 'all 0.25s',
  },
  stepNumberActive: { background: '#c9a84c', color: '#090e1a' },
  stepNumberCompleted: { background: '#10b981', color: '#090e1a' },
  stepInfo: { flex: 1, minWidth: 0 },
  stepIndicatorTitle: { fontSize: '12px', fontWeight: '700', color: '#f1f5f9', marginBottom: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' },
  stepIndicatorDescription: { fontSize: '10px', color: '#64748b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' },
  content: { marginBottom: '36px' },
  stepContent: {},
  stepTitle: { fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 8px 0', letterSpacing: '-0.5px' },
  stepDescription: { fontSize: '14px', color: '#94a3b8', margin: '0 0 28px 0' },
  levelsContainer: { display: 'flex', flexDirection: 'column', gap: '16px' },
  levelCard: {
    padding: '24px',
    borderRadius: '16px',
    border: '2px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  levelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  levelNumber: { fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' },
  badgePill: {
    fontSize: '11px', fontWeight: '700',
    padding: '4px 10px', borderRadius: '20px',
  },
  levelName: { fontSize: '18px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 8px 0' },
  levelDescription: { fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: '1.5' },
  formSection: { display: 'flex', flexDirection: 'column', gap: '24px' },
  formLabel: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' },
  select: {
    width: '100%', padding: '14px 16px',
    background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px', color: '#f1f5f9', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  },
  input: {
    width: '100%', padding: '14px 16px',
    background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px', color: '#f1f5f9', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '14px 16px',
    background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px', color: '#f1f5f9', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box', resize: 'vertical',
    fontFamily: 'inherit', lineHeight: '1.5',
  },
  infoBox: {
    display: 'flex', gap: '12px', padding: '16px',
    background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px',
  },
  infoBoxGold: {
    display: 'flex', gap: '12px', padding: '16px',
    background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px',
  },
  infoIcon: { fontSize: '18px' },
  infoText: { fontSize: '13px', color: '#93c5fd', flex: 1, lineHeight: 1.5 },
  infoTextGold: { fontSize: '13px', color: '#fcd34d', flex: 1, lineHeight: 1.5 },
  errorBox: {
    padding: '14px 16px', background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px',
    color: '#f87171', fontSize: '14px', marginBottom: '20px',
  },
  successBox: {
    padding: '14px 16px', background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px',
    color: '#34d399', fontSize: '14px', marginBottom: '20px',
  },
  reviewSection: {
    display: 'flex', flexDirection: 'column',
    padding: '24px', background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  reviewParagraph: {
    fontSize: '13px', color: '#cbd5e1', margin: 0, lineHeight: '1.6', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', width: '100%', border: '1px solid rgba(255,255,255,0.05)'
  },
  reviewItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', gap: '12px',
  },
  reviewLabel: { fontSize: '13px', color: '#94a3b8' },
  reviewValue: {
    fontSize: '13px', fontWeight: '600', color: '#f1f5f9',
    textAlign: 'right', maxWidth: '60%', overflow: 'hidden',
    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  reviewValueGreen: {
    fontSize: '13px', fontWeight: '600', color: '#10b981',
    textAlign: 'right', maxWidth: '60%', overflow: 'hidden',
    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  termsBox: {
    display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '24px',
    padding: '16px', background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  checkbox: { marginTop: '3px', cursor: 'pointer' },
  termsLabel: { fontSize: '13px', color: '#94a3b8', cursor: 'pointer', lineHeight: '1.6' },
  navigation: { display: 'flex', justifyContent: 'space-between', gap: '16px' },
  backButton: {
    padding: '12px 28px', background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px',
    color: '#cbd5e1', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    transition: 'all 0.2s',
  },
  nextButton: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #c9a84c 0%, #a88832 100%)',
    border: 'none', borderRadius: '10px',
    color: '#090e1a', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
    transition: 'all 0.2s',
  },
  submitButton: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    border: 'none', borderRadius: '10px',
    color: '#090e1a', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
    transition: 'all 0.2s',
  },
  disabledBtn: { opacity: 0.3, cursor: 'not-allowed' },
};

export default Verification;