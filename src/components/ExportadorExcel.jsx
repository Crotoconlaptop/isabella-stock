import { useState } from 'react';
import { supabase } from '../supabase/client';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

function ExportadorExcel() {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [mensaje, setMensaje] = useState('');

  const fetchAndExport = async () => {
    if (!desde || !hasta) {
      setMensaje('Seleccioná un rango de fechas');
      return;
    }

    setMensaje('Generando Excel...');

    const { data, error } = await supabase
      .from('movimientos_stock')
      .select('*')
      .gte('fecha_hora', `${desde}T00:00:00`)
      .lte('fecha_hora', `${hasta}T23:59:59`)
      .order('fecha_hora', { ascending: true });

    if (error) {
      console.error(error);
      setMensaje('Error al obtener datos');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Movimientos');

    sheet.columns = [
      { header: 'Producto', key: 'producto', width: 20 },
      { header: 'Cantidad', key: 'cantidad', width: 10 },
      { header: 'Responsable', key: 'responsable', width: 20 },
      { header: 'Fecha y Hora', key: 'fecha_hora', width: 25 },
      { header: 'Imagen', key: 'imagen_url', width: 30 }
    ];

    for (const [index, row] of data.entries()) {
      const filaIndex = index + 2;

      sheet.addRow({
        producto: row.producto,
        cantidad: row.cantidad,
        responsable: row.responsable,
        fecha_hora: new Date(row.fecha_hora).toLocaleString(),
        imagen_url: '' // se agrega imagen por separado
      });

if (row.imagen_url) {
  try {
    const fileName = row.imagen_url?.split('/').pop();
    const publicURL = `https://vysvmnjbwgjkpwukkhfh.supabase.co/storage/v1/object/public/imagenes-stock/${fileName}`;

    const response = await fetch(publicURL, {
      headers: { 'accept': 'image/*' },
      mode: 'cors'
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();

    const extension = publicURL.includes('.png') ? 'png' : 'jpeg';

    const imagenId = workbook.addImage({
      buffer,
      extension: extension
    });

    sheet.addImage(imagenId, {
      tl: { col: 4, row: filaIndex - 1 },
      ext: { width: 100, height: 100 },
    });

    sheet.getRow(filaIndex).height = 80;
  } catch (err) {
    console.error('❌ Error cargando imagen:', err.message);
  }
}

    }

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'movimientos_stock.xlsx');
    setMensaje('✅ Excel generado con éxito');
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3>Exportar movimientos a Excel</h3>

      <div>
        <label>Desde:</label><br />
        <input
          type="date"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
        />
      </div>

      <div>
        <label>Hasta:</label><br />
        <input
          type="date"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
        />
      </div>

      <button onClick={fetchAndExport} style={{ marginTop: '1rem' }}>
        Descargar Excel
      </button>

      {mensaje && <p style={{ marginTop: '1rem', color: 'green' }}>{mensaje}</p>}
    </div>
  );
}

export default ExportadorExcel;
