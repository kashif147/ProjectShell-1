import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllRoles } from "../features/RoleSlice";
import { fetchOfficerRoleUsers } from "../services/roleUsersService";
import { mapUsersToSelectOptions } from "../utils/officerRoles";

export function useOfficerRoleUsers() {
  const dispatch = useDispatch();
  const { roles, rolesLoading } = useSelector((state) => state.roles);

  const [iroUsers, setIroUsers] = useState([]);
  const [branchUsers, setBranchUsers] = useState([]);
  const [regionUsers, setRegionUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(getAllRoles());
  }, [dispatch]);

  const loadOfficerUsers = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const { iroUsers: iro, branchUsers: branch, regionUsers: region } =
        await fetchOfficerRoleUsers(roles, token);
      setIroUsers(iro);
      setBranchUsers(branch);
      setRegionUsers(region);
    } catch (err) {
      console.error("Failed to load officer role users:", err);
      setError(err.message || "Failed to load officer users");
      setIroUsers([]);
      setBranchUsers([]);
      setRegionUsers([]);
    } finally {
      setLoading(false);
    }
  }, [roles]);

  useEffect(() => {
    if (rolesLoading) return;
    loadOfficerUsers();
  }, [roles, rolesLoading, loadOfficerUsers]);

  return {
    iroUsers,
    branchUsers,
    regionUsers,
    loading: loading || rolesLoading,
    error,
    reload: loadOfficerUsers,
    iroOptions: mapUsersToSelectOptions(iroUsers),
    branchOptions: mapUsersToSelectOptions(branchUsers),
    regionOptions: mapUsersToSelectOptions(regionUsers),
  };
}
