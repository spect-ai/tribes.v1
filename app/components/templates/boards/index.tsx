import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMoralis } from "react-moralis";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import { useMoralisFunction } from "../../../hooks/useMoralisFunction";
import { notify } from "../../modules/settingsTab";
import TaskBoard from "../../modules/taskBoard";

type Props = {};

const OuterDiv = styled.div`
  margin-left: 1.5rem;
  margin-right: 1.5rem;
  width: 100%;
`;

const BoardsTemplate = (props: Props) => {
  const router = useRouter();
  const inviteCode = router.query.inviteCode as string;
  const { isAuthenticated, authenticate } = useMoralis();
  const { setSpace } = useSpace();
  const { runMoralisFunction } = useMoralisFunction();
  useEffect(() => {
    if (inviteCode) {
      if (!isAuthenticated) {
        authenticate();
        return;
      }
      runMoralisFunction("joinSpaceFromInvite", {
        inviteCode,
        boardId: router.query.bid as string,
      })
        .then((res) => {
          console.log(res);
          setSpace(res);
          notify("You have joined the space successfully");
          router.push(`/tribe/${router.query.id}/space/${router.query.bid}`);
        })
        .catch((err) => {
          console.error(err);
          router.push(`/tribe/${router.query.id}/space/${router.query.bid}`);
          notify(err.message, "error");
        });
    }
  }, [inviteCode, isAuthenticated]);

  return (
    <OuterDiv>
      <TaskBoard />
    </OuterDiv>
  );
};

export default BoardsTemplate;
