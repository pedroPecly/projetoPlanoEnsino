import React, { useState, useEffect } from 'react';

interface CargaHorariaProps {
  carga_horaria_total: number;
  carga_horaria_presencial: number;
  carga_horaria_presencial_percentual: number;
  carga_horaria_teorica: number;
  carga_horaria_teorica_percentual: number;
  carga_horaria_pratica: number;
  carga_horaria_pratica_percentual: number;
  carga_horaria_semanal: number;
  carga_horaria_semanal_percentual: number;
  carga_horaria_distancia?: number;
  carga_horaria_distancia_percentual?: number;
  onChange: (values: {
    carga_horaria_total: number;
    carga_horaria_presencial: number;
    carga_horaria_presencial_percentual: number;
    carga_horaria_teorica: number;
    carga_horaria_teorica_percentual: number;
    carga_horaria_pratica: number;
    carga_horaria_pratica_percentual: number;
    carga_horaria_semanal: number;
    carga_horaria_semanal_percentual: number;
    carga_horaria_distancia?: number;
    carga_horaria_distancia_percentual?: number;
  }) => void;
}

export const CargaHoraria: React.FC<CargaHorariaProps> = ({
  carga_horaria_total = 0,
  carga_horaria_presencial = 0,
  carga_horaria_presencial_percentual = 0,
  carga_horaria_teorica = 0,
  carga_horaria_teorica_percentual = 0,
  carga_horaria_pratica = 0,
  carga_horaria_pratica_percentual = 0,
  carga_horaria_semanal = 0,
  carga_horaria_semanal_percentual = 0,
  carga_horaria_distancia = 0,
  carga_horaria_distancia_percentual = 0,
  onChange,
}) => {
  const [values, setValues] = useState({
    carga_horaria_total,
    carga_horaria_presencial,
    carga_horaria_presencial_percentual,
    carga_horaria_teorica,
    carga_horaria_teorica_percentual,
    carga_horaria_pratica,
    carga_horaria_pratica_percentual,
    carga_horaria_semanal,
    carga_horaria_semanal_percentual,
    carga_horaria_distancia,
    carga_horaria_distancia_percentual,
  });

  useEffect(() => {
    const updatedValues = {
      ...values,
      carga_horaria_presencial_percentual: (values.carga_horaria_presencial / values.carga_horaria_total) * 100 || 0,
      carga_horaria_teorica_percentual: (values.carga_horaria_teorica / values.carga_horaria_total) * 100 || 0,
      carga_horaria_pratica_percentual: (values.carga_horaria_pratica / values.carga_horaria_total) * 100 || 0,
      carga_horaria_semanal_percentual: (values.carga_horaria_semanal / values.carga_horaria_total) * 100 || 0,
      carga_horaria_distancia_percentual: (values.carga_horaria_distancia / values.carga_horaria_total) * 100 || 0,
    };
    setValues(updatedValues);
    onChange(updatedValues);
  }, [values.carga_horaria_total, values.carga_horaria_presencial, values.carga_horaria_teorica, values.carga_horaria_pratica, values.carga_horaria_semanal, values.carga_horaria_distancia]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedValues = { ...values, [name]: Number(value) };
    setValues(updatedValues);
    if (name !== 'carga_horaria_total' && name !== 'carga_horaria_presencial' && name !== 'carga_horaria_teorica' && name !== 'carga_horaria_pratica' && name !== 'carga_horaria_semanal' && name !== 'carga_horaria_distancia') {
      onChange(updatedValues);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-gray-700">Carga Horária Total</label>
        <input
          type="number"
          name="carga_horaria_total"
          value={values.carga_horaria_total}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-200 p-0 shadow-sm focus:outline-none hover:bg-gray-50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Carga Horária Presencial</label>
        <input
          type="number"
          name="carga_horaria_presencial"
          value={values.carga_horaria_presencial}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-200 p-0 shadow-sm focus:outline-none hover:bg-gray-50"
        />
        <span className="text-sm text-gray-500">{values.carga_horaria_presencial_percentual.toFixed(2)}%</span>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Carga Horária Teórica</label>
        <input
          type="number"
          name="carga_horaria_teorica"
          value={values.carga_horaria_teorica}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-200 p-0 shadow-sm focus:outline-none hover:bg-gray-50"
        />
        <span className="text-sm text-gray-500">{values.carga_horaria_teorica_percentual.toFixed(2)}%</span>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Carga Horária Prática</label>
        <input
          type="number"
          name="carga_horaria_pratica"
          value={values.carga_horaria_pratica}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-200 p-0 shadow-sm focus:outline-none hover:bg-gray-50"
        />
        <span className="text-sm text-gray-500">{values.carga_horaria_pratica_percentual.toFixed(2)}%</span>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Carga Horária Semanal</label>
        <input
          type="number"
          name="carga_horaria_semanal"
          value={values.carga_horaria_semanal}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-200 p-0 shadow-sm focus:outline-none hover:bg-gray-50"
        />
        <span className="text-sm text-gray-500">{values.carga_horaria_semanal_percentual.toFixed(2)}%</span>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Carga Horária à Distância</label>
        <input
          type="number"
          name="carga_horaria_distancia"
          value={values.carga_horaria_distancia}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-200 p-0 shadow-sm focus:outline-none hover:bg-gray-50"
        />
        <span className="text-sm text-gray-500">{values.carga_horaria_distancia_percentual.toFixed(2)}%</span>
      </div>
    </div>
  );
};