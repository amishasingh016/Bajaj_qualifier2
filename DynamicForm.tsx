import React, { useState, useEffect } from 'react';
import { User, FormResponse, FormValues, FormErrors, FormField } from '../types';
import { getForm } from '../services/api';
import FormSection from './FormSection';

interface DynamicFormProps {
  user: User;
  onLogout: () => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ user, onLogout }) => {
  const [formData, setFormData] = useState<FormResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [formValues, setFormValues] = useState<FormValues>({});
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setIsLoading(true);
        const data = await getForm(user.rollNumber);
        setFormData(data);
        
        const initialValues: FormValues = {};
        data.form.sections.forEach(section => {
          section.fields.forEach(field => {
            if (field.type === 'checkbox' && field.options) {
              initialValues[field.fieldId] = [];
            } else if (field.type === 'checkbox' && !field.options) {
              initialValues[field.fieldId] = false;
            } else {
              initialValues[field.fieldId] = '';
            }
          });
        });
        
        setFormValues(initialValues);
      } catch (error) {
        setError('Failed to load the form. Please try again later.');
        console.error('Error fetching form:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFormData();
  }, [user.rollNumber]);

  const handleFieldChange = (fieldId: string, value: string | string[] | boolean) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
    
    if (formErrors[fieldId]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateField = (field: FormField): string => {
    const value = formValues[field.fieldId];
    
    if (field.required) {
      if (
        value === undefined || 
        value === '' || 
        (Array.isArray(value) && value.length === 0)
      ) {
        return field.validation?.message || 'This field is required';
      }
    }
    
    if (value === undefined || value === '') {
      return '';
    }
    
    if (field.minLength && typeof value === 'string' && value.length < field.minLength) {
      return `Minimum length is ${field.minLength} characters`;
    }
    
    if (field.maxLength && typeof value === 'string' && value.length > field.maxLength) {
      return `Maximum length is ${field.maxLength} characters`;
    }
    
    return '';
  };

  const validateSection = (sectionIndex: number): boolean => {
    if (!formData) return false;
    
    const section = formData.form.sections[sectionIndex];
    let isValid = true;
    const newErrors: FormErrors = {};
    
    section.fields.forEach(field => {
      const errorMessage = validateField(field);
      if (errorMessage) {
        newErrors[field.fieldId] = errorMessage;
        isValid = false;
      }
    });
    
    setFormErrors(newErrors);
    return isValid;
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const handleNext = () => {
    if (!formData) return;
    
    const isValid = validateSection(currentSectionIndex);
    if (isValid && currentSectionIndex < formData.form.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    if (!formData) return;
    
    const isValid = validateSection(currentSectionIndex);
    if (isValid) {
      console.log('Form submitted with values:', formValues);
      setShowSubmissionModal(true);
    }
  };

  const renderSubmissionModal = () => {
    if (!formData) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Form Submission Data</h2>
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {formData.form.sections.map((section, index) => (
              <div key={section.sectionId} className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {section.title}
                </h3>
                <div className="space-y-2">
                  {section.fields.map(field => {
                    const value = formValues[field.fieldId];
                    return (
                      <div key={field.fieldId} className="flex flex-col">
                        <span className="text-sm font-medium text-gray-600">
                          {field.label}:
                        </span>
                        <span className="text-gray-800">
                          {Array.isArray(value)
                            ? value.join(', ')
                            : typeof value === 'boolean'
                            ? value ? 'Yes' : 'No'
                            : value || '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
        <div className="text-center text-red-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold mt-2">Error</h2>
        </div>
        <p className="text-gray-700 mb-4">{error}</p>
        <button
          onClick={onLogout}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition"
        >
          Go Back to Login
        </button>
      </div>
    );
  }

  if (!formData) {
    return null;
  }

  const currentSection = formData.form.sections[currentSectionIndex];

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{formData.form.formTitle}</h1>
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-3">Logged in as {user.name}</span>
          <button
            onClick={onLogout}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Logout
          </button>
        </div>
      </div>
      
      <FormSection
        section={currentSection}
        values={formValues}
        errors={formErrors}
        onChange={handleFieldChange}
        currentIndex={currentSectionIndex}
        totalSections={formData.form.sections.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        isLast={currentSectionIndex === formData.form.sections.length - 1}
        onSubmit={handleSubmit}
      />

      {showSubmissionModal && renderSubmissionModal()}
    </div>
  );
};

export default DynamicForm;