import React from 'react';
import { FormField, FormValues, FormErrors } from '../types';

interface DynamicFieldProps {
  field: FormField;
  value: string | string[] | boolean;
  error?: string;
  onChange: (fieldId: string, value: string | string[] | boolean) => void;
}

const DynamicField: React.FC<DynamicFieldProps> = ({ field, value, error, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (field.type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      onChange(field.fieldId, target.checked);
    } else {
      onChange(field.fieldId, e.target.value);
    }
  };

  const handleCheckboxGroupChange = (optionValue: string) => {
    const currentValues = (value as string[]) || [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter(v => v !== optionValue)
      : [...currentValues, optionValue];
    
    onChange(field.fieldId, newValues);
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'tel':
      case 'email':
      case 'date':
        return (
          <input
            type={field.type}
            id={field.fieldId}
            value={value as string}
            onChange={handleChange}
            placeholder={field.placeholder}
            required={field.required}
            maxLength={field.maxLength}
            minLength={field.minLength}
            data-testid={field.dataTestId}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      
      case 'textarea':
        return (
          <textarea
            id={field.fieldId}
            value={value as string}
            onChange={handleChange}
            placeholder={field.placeholder}
            required={field.required}
            maxLength={field.maxLength}
            minLength={field.minLength}
            data-testid={field.dataTestId}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
          />
        );
      
      case 'dropdown':
        return (
          <select
            id={field.fieldId}
            value={value as string}
            onChange={handleChange}
            required={field.required}
            data-testid={field.dataTestId}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an option</option>
            {field.options?.map(option => (
              <option 
                key={option.value} 
                value={option.value}
                data-testid={option.dataTestId}
              >
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.fieldId}-${option.value}`}
                  name={field.fieldId}
                  value={option.value}
                  checked={value === option.value}
                  onChange={handleChange}
                  data-testid={option.dataTestId || `${field.dataTestId}-${option.value}`}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label 
                  htmlFor={`${field.fieldId}-${option.value}`}
                  className="text-sm text-gray-700"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      
      case 'checkbox':
        if (field.options) {
          // Multiple checkboxes (array of values)
          return (
            <div className="space-y-2">
              {field.options.map(option => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${field.fieldId}-${option.value}`}
                    name={`${field.fieldId}[]`}
                    value={option.value}
                    checked={(value as string[])?.includes(option.value)}
                    onChange={() => handleCheckboxGroupChange(option.value)}
                    data-testid={option.dataTestId || `${field.dataTestId}-${option.value}`}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label 
                    htmlFor={`${field.fieldId}-${option.value}`}
                    className="text-sm text-gray-700"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          );
        } else {
          // Single checkbox (boolean value)
          return (
            <div className="flex items-center">
              <input
                type="checkbox"
                id={field.fieldId}
                name={field.fieldId}
                checked={value as boolean}
                onChange={handleChange}
                required={field.required}
                data-testid={field.dataTestId}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <label 
                htmlFor={field.fieldId}
                className="text-sm text-gray-700"
              >
                {field.label}
              </label>
            </div>
          );
        }
      
      default:
        return <div>Unsupported field type: {field.type}</div>;
    }
  };

  return (
    <div className="mb-4">
      {field.type !== 'checkbox' && (
        <label 
          htmlFor={field.fieldId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {renderField()}
      
      {error && (
        <p className="mt-1 text-sm text-red-600" data-testid={`${field.dataTestId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default DynamicField;