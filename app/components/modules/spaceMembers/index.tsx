import { useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { getTeam, updateBoardMembers } from "../../../adapters/moralis";
import { BoardData, Team } from "../../../types";
import styled from "@emotion/styled";
import { PrimaryButton } from "../../elements/styledComponents";
import { Toaster } from "react-hot-toast";
import { notify } from "../settingsTab";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import MemberTable from "../../elements/memberTable";
import SpaceRoleMapping from "../../elements/spaceRoleMapping";

type Props = {};

const SpaceMembers = (props: Props) => {
  const { space, setSpace } = useSpace();
  const [tribe, setTribe] = useState<Team>({} as Team);
  const [isLoading, setIsLoading] = useState(false);
  const { Moralis, user } = useMoralis();
  const [isChecked, setIsChecked] = useState([] as boolean[]);
  const [roles, setRoles] = useState({} as { [key: string]: number });

  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  useEffect(() => {
    // getTeam(Moralis, space.teamId)
    //   .then((res: Team) => {
    //     setTribe(res);
    //     const membersArray = res.members.map((member: string) => {
    //       return space.members.indexOf(member) !== -1;
    //     });
    //     let roles = {};
    //     res.members.map((member: string) => {
    //       // @ts-ignore
    //       roles[member] = space.roles[member] || 0;
    //     });
    //     setRoles(roles);
    //     setIsChecked(membersArray);
    //   })
    //   .catch((err: any) => {
    //     notify(`Sorry! There was an error while loading members.`, "error");
    //   });
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
    updateBoardMembers(Moralis, space.objectId, members, roles)
      .then((res: BoardData) => {
        setIsLoading(false);
        setSpace(res);
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
      {/* <MemberTable
        isChecked={isChecked}
        setIsChecked={setIsChecked}
        members={tribe.members}
        memberDetails={tribe.memberDetails}
        roles={roles}
        setRoles={setRoles}
        entity={space}
      /> */}
      {/* {space.roles[user?.id as string] === 3 && (
        <PrimaryButton
          variant="outlined"
          color="secondary"
          sx={{ borderRadius: 1, width: "20%", mt: 2 }}
          fullWidth
          onClick={onSave}
          loading={isLoading}
        >
          Save
        </PrimaryButton>
      )} */}
      <SpaceRoleMapping isOpen={isOpen} handleClose={handleClose} />
      <PrimaryButton
        variant="outlined"
        color="secondary"
        sx={{ borderRadius: 1, width: "20%", mt: 2 }}
        fullWidth
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Import Members from Discord
      </PrimaryButton>
    </Container>
  );
};

const Container = styled.div``;

export default SpaceMembers;
