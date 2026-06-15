import { gql } from '@apollo/client'

const opportunitySummaryFields = `
  id
  title
  productName
  shortDescription
  status
  currency
  createdAt
  updatedAt
`

export const MY_UGC_ORDERS_QUERY = gql`
  query MyUgcOrders($status: OpportunityStatus) {
    myUgcOrders(status: $status) {
      ${opportunitySummaryFields}
      totalBudget
      deadline
      numberOfCreators
      flatRatePerCreator
    }
  }
`

export const MY_CPM_DEALS_QUERY = gql`
  query MyCpmDeals($status: OpportunityStatus) {
    myCpmDeals(status: $status) {
      ${opportunitySummaryFields}
      maxCampaignBudget
      postingDeadline
      finalViewCountDeadline
      numberOfCreators
    }
  }
`

export const MY_CONTESTS_QUERY = gql`
  query MyContests($status: OpportunityStatus) {
    myContests(status: $status) {
      ${opportunitySummaryFields}
      totalContestBudget
      submissionDeadline
      winnerAnnouncementDate
      minimumWinners
    }
  }
`

export const CREATE_UGC_ORDER_MUTATION = gql`
  mutation CreateUgcOrder($input: CreateUgcOrderInput!) {
    createUgcOrder(input: $input) {
      id
      title
      status
      totalBudget
      currency
    }
  }
`

export const UPDATE_UGC_ORDER_MUTATION = gql`
  mutation UpdateUgcOrder($id: ID!, $input: CreateUgcOrderInput!) {
    updateUgcOrder(id: $id, input: $input) {
      id
      title
      status
      totalBudget
      currency
    }
  }
`

export const CREATE_CPM_DEAL_MUTATION = gql`
  mutation CreateCpmDeal($input: CreateCpmDealInput!) {
    createCpmDeal(input: $input) {
      id
      title
      status
      maxCampaignBudget
      currency
    }
  }
`

export const UPDATE_CPM_DEAL_MUTATION = gql`
  mutation UpdateCpmDeal($id: ID!, $input: CreateCpmDealInput!) {
    updateCpmDeal(id: $id, input: $input) {
      id
      title
      status
      maxCampaignBudget
      currency
    }
  }
`

export const CREATE_CONTEST_MUTATION = gql`
  mutation CreateContest($input: CreateContestInput!) {
    createContest(input: $input) {
      id
      title
      status
      totalContestBudget
      currency
    }
  }
`

export const UPDATE_CONTEST_MUTATION = gql`
  mutation UpdateContest($id: ID!, $input: CreateContestInput!) {
    updateContest(id: $id, input: $input) {
      id
      title
      status
      totalContestBudget
      currency
    }
  }
`

export const SUBMIT_OPPORTUNITY_FOR_APPROVAL_MUTATION = gql`
  mutation SubmitOpportunityForApproval($type: OpportunityType!, $id: ID!) {
    submitOpportunityForApproval(type: $type, id: $id) {
      ... on UgcOrder {
        id
        status
      }
      ... on CpmDeal {
        id
        status
      }
      ... on Contest {
        id
        status
      }
    }
  }
`
