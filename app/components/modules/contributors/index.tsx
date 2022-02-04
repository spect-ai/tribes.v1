import React from 'react'
import styled from '@emotion/styled';
import ContributorsTableComponent from '../../ContributorsTab/ContributorsTableComponent';
import {muiTheme} from '../../../constants/muiTheme'
const Contributor = () => {
    return (
        <Wrapper>
            <MainContainer>
                <ContributorsTableComponent/>
            </MainContainer>
            <SideContainer>
                <DescriptionContainer>
                    <Title>
                        Remaining Votes
                    </Title>
                    <Value>
                        29
                    </Value>
                </DescriptionContainer>
                <DescriptionContainer>
                    <Title>
                        Budget
                    </Title>
                    <Value>
                        $ 500
                    </Value>
                </DescriptionContainer>
                <DescriptionContainer>
                    <Title>
                        Total Votes Allocated
                    </Title>
                    <Value>
                        100
                    </Value>
                </DescriptionContainer>
                <DescriptionContainer>
                    <Title>
                        Remaining time
                    </Title>
                    <Value>
                        2 hours left
                    </Value>
                </DescriptionContainer>
            </SideContainer>
        </Wrapper>
    )
}

export default Contributor;


const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    align-items: center;

    & > div {
        width: 100%;
        display: flex;
        justify-content: space-between;
        padding: 1rem 2rem;
    }
`

const MainContainer = styled.div`
    flex: 4;
`

const SideContainer = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    margin-top: 10px;
    border-left: 1px solid #282b2f;
    align-content: flex-start;
    justify-content: flex-start;
`

const DescriptionContainer = styled.div`
    display: flex;
    flex-direction: column;
    padding-bottom: 16px;

`

const Title = styled.div`
    font-size: 12px;
    margin-bottom: 8;
    margin-top: 8;
    color: ${muiTheme.palette.text.secondary};
`

const Value = styled.div`
    font-size: 16px;
    margin-bottom: 8;
    margin-top: 8;
    color: ${muiTheme.palette.text.primary}
    
`