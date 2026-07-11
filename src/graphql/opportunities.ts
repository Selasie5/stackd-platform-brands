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

const ugcOrderDetailFields = `
  ${opportunitySummaryFields}
  totalBudget
  deadline
  numberOfCreators
  flatRatePerCreator
  fullDescription
  externalBriefLink
  videoType
  videoLengthSeconds
  wordsToSay
  wordsToAvoid
  callToAction
  requiredShots
  revisionLimit
  postingRequired
  targetPlatform
  productDeliveryDetails
  usageRightsPackage
  referenceLinks {
    url
    label
  }
`

const cpmDealDetailFields = `
  ${opportunitySummaryFields}
  maxCampaignBudget
  postingDeadline
  finalViewCountDeadline
  numberOfCreators
  fullDescription
  externalBriefLink
  targetPlatform
  requiredHashtags
  requiredCaption
  requiredBrandTag
  payPer1000Views
  maxPayableViewsPerCreator
  productDeliveryDetails
  usageRightsPackage
  referenceLinks {
    url
    label
  }
`

const contestDetailFields = `
  ${opportunitySummaryFields}
  totalContestBudget
  submissionDeadline
  winnerAnnouncementDate
  minimumWinners
  fullDescription
  externalBriefLink
  category
  videoType
  videoLengthSeconds
  targetPlatform
  requiredHashtags
  requiredCaption
  requiredBrandTag
  postingRequired
  contestRules
  eligibilityRules
  usageRightsPackage
  productDeliveryDetails
  cpmBudget
  payPer1000Views
  maxPayableViewsPerCreator
  referenceLinks {
    url
    label
    isInspiration
  }
  rewards {
    placement
    label
    amount
    currency
  }
`

export const UGC_ORDER_QUERY = gql`
  query UgcOrder($id: ID!) {
    ugcOrder(id: $id) {
      ${ugcOrderDetailFields}
    }
  }
`

export const CPM_DEAL_QUERY = gql`
  query CpmDeal($id: ID!) {
    cpmDeal(id: $id) {
      ${cpmDealDetailFields}
    }
  }
`

export const CONTEST_QUERY = gql`
  query Contest($id: ID!) {
    contest(id: $id) {
      ${contestDetailFields}
    }
  }
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

const opportunityTransitionFields = `
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
`

export const PAUSE_OPPORTUNITY_MUTATION = gql`
  mutation PauseOpportunity($type: OpportunityType!, $id: ID!) {
    pauseOpportunity(type: $type, id: $id) {
      ${opportunityTransitionFields}
    }
  }
`

export const RESUME_OPPORTUNITY_MUTATION = gql`
  mutation ResumeOpportunity($type: OpportunityType!, $id: ID!) {
    resumeOpportunity(type: $type, id: $id) {
      ${opportunityTransitionFields}
    }
  }
`

export const CLOSE_OPPORTUNITY_MUTATION = gql`
  mutation CloseOpportunity($type: OpportunityType!, $id: ID!) {
    closeOpportunity(type: $type, id: $id) {
      ${opportunityTransitionFields}
    }
  }
`

export const COMPLETE_OPPORTUNITY_MUTATION = gql`
  mutation CompleteOpportunity($type: OpportunityType!, $id: ID!) {
    completeOpportunity(type: $type, id: $id) {
      ${opportunityTransitionFields}
    }
  }
`
