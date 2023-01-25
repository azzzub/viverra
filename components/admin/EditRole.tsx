// React deps
import { useState } from "react";

// External
import axios from "axios";
import toast from "react-hot-toast";
import { useMutation } from "react-query";

export default function EditRole({ cb, userDetail }: any) {
  const [value, setValue] = useState({
    userID: userDetail.id,
    role: userDetail.role,
  });

  // Update user role
  const updateRole = useMutation(
    async (v: any) => {
      return await axios.put("/api/admin/user", v);
    },
    {
      onSuccess() {
        toast.success("update role success");
        cb("success_fetch");
      },
      onError(error: any) {
        toast.error(error.response?.data?.error || error.message);
      },
    }
  );

  return (
    <tr>
      <td colSpan={5}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateRole.mutate(value);
          }}
        >
          <div>
            <b>user role:</b>
            <ul>
              <li>0 = guest</li>
              <li>1 = editor</li>
              <li>2 = admin / super user</li>
            </ul>
          </div>
          <input
            type="number"
            name="name"
            placeholder="team name*"
            required
            value={value.role}
            onChange={(e) => setValue({ ...value, role: e.target.value })}
          />
          <div className="grid">
            <button aria-busy={updateRole.isLoading} type="submit">
              save
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => cb("cancel")}
            >
              cancel
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}
