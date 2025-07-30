import React, { useState } from 'react';
import { OrganizationRegistrationData, organizationService } from '../../../services/organizationService';

interface LegalInfoStepProps {
  data: Partial<OrganizationRegistrationData>;
  errors: Record<string, string>;
  onChange: (data: Partial<OrganizationRegistrationData>) => void;
}

export const LegalInfoStep: React.FC<LegalInfoStepProps> = ({ data, errors, onChange }) => {
  const [binLookupLoading, setBinLookupLoading] = useState(false);

  const handleLegalInfoChange = (field: string, value: string | boolean) => {
    onChange({
      legalInfo: {
        isIndividualEntrepreneur: data.legalInfo?.isIndividualEntrepreneur ?? false,
        ...data.legalInfo,
        [field]: value
      }
    });
  };

  const handleBinLookup = async () => {
    const bin = data.legalInfo?.bin;
    if (!bin || bin.length !== 12) return;

    setBinLookupLoading(true);
    try {
      const result = await organizationService.lookupByBin(bin);
      if (result.success && result.data) {
        onChange({
          legalInfo: {
            isIndividualEntrepreneur: data.legalInfo?.isIndividualEntrepreneur ?? false,
            ...data.legalInfo,
            bin: result.data.bin,
            legalName: result.data.legalName,
            registrationDate: result.data.registrationDate,
            taxRegime: result.data.taxRegime,
            director: result.data.director
          }
        });
      }
    } catch (error) {
      console.error('Error looking up BIN:', error);
    } finally {
      setBinLookupLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Юридическая информация
        </h2>
        <p className="text-gray-600 mb-8">
          Укажите юридические данные организации для официального партнерства.
        </p>
      </div>

      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={data.legalInfo?.isIndividualEntrepreneur || false}
            onChange={(e) => handleLegalInfoChange('isIndividualEntrepreneur', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">
            Индивидуальный предприниматель
          </span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          БИН/ИИН
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={data.legalInfo?.bin || ''}
            onChange={(e) => handleLegalInfoChange('bin', e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
            placeholder="123456789012"
            maxLength={12}
          />
          <button
            type="button"
            onClick={handleBinLookup}
            disabled={binLookupLoading || !data.legalInfo?.bin || data.legalInfo.bin.length !== 12}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg disabled:bg-gray-300"
          >
            {binLookupLoading ? '...' : 'Найти'}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Юридическое наименование
        </label>
        <input
          type="text"
          value={data.legalInfo?.legalName || ''}
          onChange={(e) => handleLegalInfoChange('legalName', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Руководитель
        </label>
        <input
          type="text"
          value={data.legalInfo?.director || ''}
          onChange={(e) => handleLegalInfoChange('director', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
        />
      </div>
    </div>
  );
}; 