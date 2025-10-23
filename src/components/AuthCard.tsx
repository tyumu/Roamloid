import React from 'react';

type Field = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
};

type Props = {
  title: string;
  fields: Field[];
  onSubmit: (values: Record<string, string>) => Promise<{ ok: boolean; message?: string }>;
  submitLabel?: string;
};

const AuthCard: React.FC<Props> = ({ title, fields, onSubmit, submitLabel = '送信' }) => {
  const [values, setValues] = React.useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    fields.forEach(f => (init[f.name] = ''));
    return init;
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues(v => ({ ...v, [name]: e.target.value }));
  };

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await onSubmit(values);
      if (!res.ok) setError(res.message || 'エラーが発生しました');
    } catch (err: any) {
      // Normalize common network errors to friendly Japanese messages
      const msg = err?.message || String(err);
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Network request failed')) {
        setError('サーバーに接続できませんでした。サーバーが起動しているかネットワークを確認してください。');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-root">
      <form className="register-card" onSubmit={handleSubmit}>
        <h2>{title}</h2>
        {fields.map(f => (
          <div key={f.name} style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>{f.label}</label>
            <input
              className="input-full"
              type={f.type || 'text'}
              placeholder={f.placeholder}
              value={values[f.name]}
              onChange={handleChange(f.name)}
            />
          </div>
        ))}
        {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
        <button className="full-button" type="submit" disabled={loading}>{loading ? '処理中…' : submitLabel}</button>
      </form>
    </div>
  );
};

export default AuthCard;
