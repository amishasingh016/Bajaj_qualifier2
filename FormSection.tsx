import React from 'react';
import DynamicField from './DynamicField';
import { FormSection as FormSectionType, FormValues, FormErrors } from '../types';

interface FormSectionProps {
  section: FormSectionType;
  values: FormValues;
  errors: FormErrors;
  onChange: (fieldId: string, value: string | string[] | boolean) => void;
  currentIndex: number;
  totalSections: number;
  onPrevious: () => void;
  onNext: () => void;
  isLast: boolean;
  onSubmit: () => void;
}

const FormSection: React.FC<FormSectionProps> = ({
  section,
  values,
  errors,
  onChange,
  currentIndex,
  totalSections,
  onPrevious,
  onNext,
  isLast,
  onSubmit
}) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md animate-fadeIn">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-gray-800">{section.title}</h2>
          <span className="text-sm text-gray-500">
            Section {currentIndex + 1} of {totalSections}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${((currentIndex + 1) / totalSections) * 100}%` }}
          ></div>
        </div>
        
        {section.description && (
          <p className="mt-2 text-sm text-gray-600">{section.description}</p>
        )}
      </div>
      
      <div className="space-y-4">
        {section.fields.map(field => (
          <DynamicField
            key={field.fieldId}
            field={field}
            value={values[field.fieldId] || (field.type === 'checkbox' && !field.options ? false : field.options ? [] : '')}
            error={errors[field.fieldId]}
            onChange={onChange}
          />
        ))}
      </div>
      
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Previous
        </button>
        
        {isLast ? (
          <button
            type="button"
            onClick={onSubmit}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
          >
            Submit
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default FormSection;