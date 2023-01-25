// React deps
import { useState } from "react";

// External
import axios from "axios";
import toast from "react-hot-toast";
import { useMutation } from "react-query";

export default function UpdateTeam({ cb, teamDetail }: any) {
  const [value, setValue] = useState({
    name: teamDetail.name,
    slackMention: teamDetail.slackMention || "",
    webhook: teamDetail.webhook || "",
    teamID: teamDetail.id,
  });

  const updateTeam = useMutation(
    async (v: any) => {
      return await axios.put("/api/admin/team", v);
    },
    {
      onSuccess() {
        toast.success("update team success");
        cb("success_fetch");
      },
      onError(error: any) {
        toast.error(error.message);
      },
    }
  );

  return (
    <tr>
      <td colSpan={5}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateTeam.mutate(value);
          }}
        >
          <input
            type="text"
            name="name"
            placeholder="team name*"
            required
            value={value.name}
            onChange={(e) => setValue({ ...value, name: e.target.value })}
          />
          <input
            type="text"
            name="name"
            placeholder="slack mention"
            value={value.slackMention}
            onChange={(e) =>
              setValue({ ...value, slackMention: e.target.value })
            }
          />
          <input
            type="text"
            name="name"
            placeholder="webhook"
            value={value.webhook}
            onChange={(e) => setValue({ ...value, webhook: e.target.value })}
          />
          <div className="grid">
            <button aria-busy={updateTeam.isLoading} type="submit">
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
