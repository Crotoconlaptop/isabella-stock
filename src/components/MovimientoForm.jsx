import { useState } from 'react';
import { supabase } from '../supabase/client';

function MovimientoForm() {
  const [producto, setProducto] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [responsable, setResponsable] = useState('');
  const [imagen, setImagen] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación
    if (!producto || !cantidad || !responsable) {
      setMensaje('Por favor completá todos los campos obligatorios');
      return;
    }

    let imagen_url = null;

    // SUBIR IMAGEN si hay
    if (imagen) {
      const nombreArchivo = `${Date.now()}-${imagen.name}`;
      try {
        const { data, error } = await supabase.storage
          .from('imagenes-stock') // Nombre exacto del bucket en Supabase
          .upload(nombreArchivo, imagen);

        if (error) {
          console.error('Error al subir imagen:', error.message);
          setMensaje(`Error al subir imagen: ${error.message}`);
          return;
        }

        const { data: urlData } = supabase
          .storage
          .from('imagenes_stock')
          .getPublicUrl(nombreArchivo);

        imagen_url = urlData.publicUrl;
      } catch (err) {
        console.error('Error general al subir imagen:', err.message);
        setMensaje('Error inesperado al subir imagen.');
        return;
      }
    }

    // GUARDAR EN BASE DE DATOS
    const { error: insertError } = await supabase
      .from('movimientos_stock')
      .insert([{ producto, cantidad, responsable, imagen_url }]);

    if (insertError) {
      console.error('Error al guardar en Supabase:', insertError.message);
      setMensaje('Error al guardar en la base de datos');
    } else {
      setMensaje('✅ Movimiento guardado con éxito');
      setProducto('');
      setCantidad(1);
      setResponsable('');
      setImagen(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
      <h2>Control de Movimiento de Stock</h2>

      <div>
        <label>Producto:</label><br />
        <input
          type="text"
          value={producto}
          onChange={(e) => setProducto(e.target.value)}
        />
      </div>

      <div>
        <label>Cantidad:</label><br />
        <input
          type="number"
          min="1"
          value={cantidad}
          onChange={(e) => setCantidad(parseInt(e.target.value))}
        />
      </div>

      <div>
        <label>Responsable:</label><br />
        <input
          type="text"
          value={responsable}
          onChange={(e) => setResponsable(e.target.value)}
        />
      </div>

      <div>
        <label>Imagen (solo .jpg o .png):</label><br />
        <input
          type="file"
          accept="image/png, image/jpeg"
          onChange={(e) => setImagen(e.target.files[0])}
        />
      </div>

      <button type="submit" style={{ marginTop: '1rem' }}>
        Guardar movimiento
      </button>

      {mensaje && <p style={{ marginTop: '1rem', color: 'green' }}>{mensaje}</p>}
    </form>
  );
}

export default MovimientoForm;
