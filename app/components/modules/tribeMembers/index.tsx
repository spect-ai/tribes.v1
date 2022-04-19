import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useMoralis } from "react-moralis";
import { useTribe } from "../../../../pages/tribe/[id]";
import { updateTribeMembers } from "../../../adapters/moralis";
import { Team } from "../../../types";
import MemberTable from "../../elements/memberTable";
import { PrimaryButton } from "../../elements/styledComponents";
import { notify } from "../settingsTab";

type Props = {};

const TribeMembers = (props: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { tribe, setTribe } = useTribe();
  const { Moralis, user } = useMoralis();
  const [isChecked, setIsChecked] = useState<boolean[]>([] as boolean[]);
  const [roles, setRoles] = useState({} as { [key: string]: number });
  useEffect(() => {
    setRoles(tribe.roles);
  }, []);
  const onSave = () => {
    setIsLoading(true);
    const members = tribe.members.filter((member: string, index: number) => {
      return isChecked[index];
    });
    let adminExists;
    members.map((member: string) => {
      if (roles[member] === 3) {
        adminExists = true;
        return;
      }
    });
    if (!adminExists) {
      notify(`You must have at least one admin.`, "error");
      setIsLoading(false);
      return;
    }
    updateTribeMembers(Moralis, tribe.teamId, members, roles)
      .then((res: Team) => {
        setIsLoading(false);
        setTribe(res);
        notify("Members updated successfully");
      })
      .catch((err: any) => {
        console.log(err);
        notify("Sorry! There was an error while updating members.", "error");
        setIsLoading(false);
      });
  };
  return (
    <Container>
      <Toaster />
      <MemberTable
        isChecked={isChecked}
        setIsChecked={setIsChecked}
        members={tribe.members}
        memberDetails={tribe.memberDetails}
        roles={roles}
        setRoles={setRoles}
        entity={tribe}
      />
    </Container>
  );
};

const Container = styled.div``;

export default TribeMembers;
