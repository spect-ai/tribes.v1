import styled from "@emotion/styled";

export const PopoverContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 8px;
  width: 18rem;
`;

export const LabelChip = styled.div`
  background-color: ${(props: any) => props.color};
  font-size: 14px;
  font-weight: 600;
  color: #eaeaea;
  padding-left: 6px;
  padding-right: 6px;
  padding-top: 2px;
  padding-top: 2px;

  border-radius: 4px;
  margin-right: 4px;
  max-height: 1.5rem;
`;
