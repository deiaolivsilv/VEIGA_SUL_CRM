import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
