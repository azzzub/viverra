/* eslint-disable require-jsdoc */
// React deps
import React, { useState } from "react";

// External
import axios from "axios";
import toast from "react-hot-toast";
import { useMutation } from "react-query";

export default function NewTeamMember({ cb, teamID }: any) {
  const [value, setValue] = useState({
    username: "",
    teamID,
  });

  // Update team member
  const addTeamMemberMutation = useMutation(
    async (v: any) => {
      return await axios.post("/api/admin/team/member", v);
    },
    {
      onSuccess() {
        toast.success("add team member success");
        cb("success_fetch");
      },
      onError(error: any) {
        toast.error(error?.response?.data?.error || error.message);
      },
    }
  );

  return (
    <tr>
      <td colSpan={5}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTeamMemberMutation.mutate(value);
          }}
        >
          <input
            type="text"
            name="name"
            placeholder="username*"
            required
            onChange={(e) => setValue({ ...value, username: e.target.value })}
          />
          <div className="grid">
            <button aria-busy={addTeamMemberMutation.isLoading} type="submit">
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
