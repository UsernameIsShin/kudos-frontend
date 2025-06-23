// components/editForm.tsx
import React from "react";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Button } from "@progress/kendo-react-buttons";

interface EditFormProps {
  item: Record<string, any>;
  columnHeaders?: Record<string, string>;
  onSubmit: (data: Record<string, any>) => void;
  cancelEdit: () => void;
}

const EditForm: React.FC<EditFormProps> = ({
  item,
  columnHeaders = {},
  onSubmit,
  cancelEdit,
}) => {
  const [formData, setFormData] = React.useState(item);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog title="Edit" onClose={cancelEdit}>
      <div style={{ maxHeight: 300, overflowY: "auto", padding: 10 }}>
        {Object.entries(formData)
          .filter(([key]) => key in columnHeaders) // ❗️헤더 매핑이 있는 key만 렌더링
          .map(([key, value]) => (
            <div key={key} style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontWeight: "bold" }}>
                {columnHeaders[key] || key}
              </label>
              <input
                className="k-textbox"
                type="text"
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
          ))}
      </div>
      <DialogActionsBar>
        <Button themeColor="primary" onClick={handleSubmit}>
          Update
        </Button>
        <Button onClick={cancelEdit}>Cancel</Button>
      </DialogActionsBar>
    </Dialog>
  );
};

export default EditForm;
