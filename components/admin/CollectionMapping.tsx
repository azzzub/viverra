// React deps
import { useState } from "react";

// External
import axios from "axios";
import toast from "react-hot-toast";
import { useMutation } from "react-query";

export default function CollectionMapping({ cb, teamID }: any) {
  const [value, setValue] = useState({
    collectionID: "",
    teamID,
  });

  // Collection mapping
  const collectionMappingMutation = useMutation(
    async (v: any) => {
      return await axios.post("/api/admin/team/collection", v);
    },
    {
      onSuccess() {
        toast.success("collection mapping success");
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
            collectionMappingMutation.mutate(value);
          }}
        >
          <input
            type="text"
            name="name"
            placeholder="collection id*"
            required
            onChange={(e) =>
              setValue({ ...value, collectionID: e.target.value })
            }
          />
          <div className="grid">
            <button
              aria-busy={collectionMappingMutation.isLoading}
              type="submit"
            >
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
