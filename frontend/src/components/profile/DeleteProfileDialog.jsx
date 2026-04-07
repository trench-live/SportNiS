export function DeleteProfileDialog({ isOpen, busy, onClose, onConfirm }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="glass-panel modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="eyebrow">Подтверждение</div>
        <h3 className="modal-title">Удалить профиль?</h3>
        <p className="modal-text">
          Профиль будет удален без возможности восстановления. Связанные листинги и отклики тоже удалятся.
        </p>
        <div className="dialog-actions">
          <button className="secondary-button" type="button" onClick={onClose}>
            Отмена
          </button>
          <button className="primary-button destructive-button" type="button" disabled={busy} onClick={onConfirm}>
            {busy ? "Удаляем..." : "Удалить профиль"}
          </button>
        </div>
      </div>
    </div>
  );
}
