import {useEffect} from "react";
import TableComponent from '../../component/common/TableComponent'
import { getAllBatches } from "../../features/BatchesSlice";
import moment from "moment";
import { useSelector, useDispatch } from "react-redux";

function OnlinePayment() {
  const dispatch = useDispatch();
  dispatch(getAllBatches());
  const { batches, batchesloading, batcheserror } = useSelector((state) => state.batches);
  useEffect(() => {
    dispatch(getAllBatches());
  }, [dispatch]);

  const chequeBatches = batches.filter(batch => batch.PaymentType === "Online Payments");

  const dataSource = [
  {
    key: '1',
    memberId: 'MEM-001',
    fullName: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    joinDate: '2023-01-15',
    category: 'Premium',
    membershipStatus: 'Active',
    renewalDate: '2024-01-15',
    transactionId: 'TXN-7890123',
    paidAmount: '$199.99',
    paymentDate: '2024-01-10',
    paymentMethod: 'Credit Card',
    paymentStatus: 'Completed',
    billingCycle: 'Annual'
  },
  {
    key: '2',
    memberId: 'MEM-002',
    fullName: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 987-6543',
    joinDate: '2023-03-22',
    category: 'Basic',
    membershipStatus: 'Pending',
    renewalDate: '2024-03-22',
    transactionId: 'TXN-7890124',
    paidAmount: '$99.99',
    paymentDate: '2024-03-18',
    paymentMethod: 'PayPal',
    paymentStatus: 'Processing',
    billingCycle: 'Annual'
  },
  {
    key: '3',
    memberId: 'MEM-003',
    fullName: 'Robert Chen',
    email: 'r.chen@example.com',
    phone: '+1 (555) 456-7890',
    joinDate: '2023-06-10',
    category: 'Premium',
    membershipStatus: 'Active',
    renewalDate: '2023-12-10',
    transactionId: 'TXN-7890125',
    paidAmount: '$49.99',
    paymentDate: '2023-12-05',
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Completed',
    billingCycle: 'Semi-Annual'
  }
];
  return (
    <div>
       <TableComponent data={dataSource} screenName="onlinePayment" />
    </div>
  )
}

export default OnlinePayment
