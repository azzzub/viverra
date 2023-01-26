// React deps
import { useState } from "react";

// External
import axios from "axios";
import toast from "react-hot-toast";
import { useMutation } from "react-query";

export default function NewTeam({ cb }: any) {
  const [value, setValue] = useState({
    name: "",
  });

  const newTeam = useMutation(
    async (v: any) => {
      return await axios.post("/api/admin/team", v);
    },
    {
      onSuccess() {
        toast.success("create new team success");
        cb("success_fetch");
      },
      onError(error: any) {
        toast.error(error?.response?.data?.error || error.message);
      },
    }
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        newTeam.mutate(value);
      }}
    >
      <input
        type="text"
        name="name"
        placeholder="team name*"
        required
        onChange={(e) => setValue({ ...value, name: e.target.value })}
      />
      <div className="grid">
        <button aria-busy={newTeam.isLoading} type="submit">
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
  );
}
