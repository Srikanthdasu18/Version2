import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Wrench, ShoppingBag, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/order.service';
import { serviceRequestService } from '../../services/service-request.service';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { formatCurrency, formatDate } from '../../utils/format';
import toast from 'react-hot-toast';
import type { Order, ServiceRequest } from '../../types';

export function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [ordersData, serviceRequestsData] = await Promise.all([
        orderService.getOrders(user.id, 'customer'),
        serviceRequestService.getServiceRequests(user.id, 'customer'),
      ]);
      setOrders(ordersData.slice(0, 5));
      setServiceRequests(serviceRequestsData.slice(0, 5));
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      pending: 'warning',
      assigned: 'info',
      in_progress: 'info',
      parts_recommended: 'warning',
      completed: 'success',
      cancelled: 'danger',
      paid: 'success',
      processing: 'info',
      shipped: 'info',
      delivered: 'success',
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your account</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <CardContent>
              <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{orders.length}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent>
              <Wrench className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {serviceRequests.length}
              </div>
              <div className="text-sm text-gray-600">Service Requests</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent>
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {serviceRequests.filter((sr) => sr.status === 'in_progress').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent>
              <ShoppingBag className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {formatCurrency(
                  orders.reduce((sum, order) => sum + order.total_amount, 0)
                )}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => navigate('/products')} className="h-20 flex flex-col">
                  <ShoppingBag className="h-6 w-6 mb-1" />
                  <span>Browse Parts</span>
                </Button>
                <Button onClick={() => navigate('/services')} className="h-20 flex flex-col">
                  <Wrench className="h-6 w-6 mb-1" />
                  <span>Request Service</span>
                </Button>
                <Button
                  onClick={() => navigate('/orders')}
                  variant="outline"
                  className="h-20 flex flex-col"
                >
                  <Package className="h-6 w-6 mb-1" />
                  <span>My Orders</span>
                </Button>
                <Button
                  onClick={() => navigate('/cart')}
                  variant="outline"
                  className="h-20 flex flex-col"
                >
                  <ShoppingBag className="h-6 w-6 mb-1" />
                  <span>View Cart</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Service Requests</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/services')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {serviceRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Wrench className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No service requests yet</p>
                  <Button
                    size="sm"
                    className="mt-4"
                    onClick={() => navigate('/services')}
                  >
                    Request Service
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {serviceRequests.slice(0, 3).map((request) => (
                    <div
                      key={request.id}
                      className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{request.vehicle_type}</p>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {request.issue_description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(request.created_at)}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(request.status)}>
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No orders yet</p>
                <Button size="sm" className="mt-4" onClick={() => navigate('/products')}>
                  Start Shopping
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Order Number
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {order.order_number}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
