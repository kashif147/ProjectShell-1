import React, { useState,useEffect } from 'react';
import { Shield, Heart, FileText, Users, Gift, Home, Percent, Trophy } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export const InsuranceScreen = () => {
  const containerStyle = {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
    height: '100%', // Changed from minHeight to height
    overflowY: 'auto', // Added for scrolling
    padding: '0.75rem'
  };

  const blue800Style = {
    backgroundColor: '#1e40af'
  };

  const blue700Style = {
    backgroundColor: '#1d4ed8'
  };

  const blue900Style = {
    backgroundColor: '#1e3a8a'
  };

  return (
    <div style={containerStyle}>
      <div className="container" style={{ maxWidth: '100%' }}>

        {/* Header */}
        <div style={blue800Style} className="text-white p-4 rounded-top mb-3">
          <h1 className="h2 font-weight-bold mb-3">
            INMO Income Protection Scheme – Automatic Access and 9 Months' Free Cover!
          </h1>
          <div style={{ ...blue900Style, }} className="p-3 rounded small">
            <p>The INMO has negotiated automatic membership of the INMO Income Protection Scheme, for new INMO graduate members who:</p>
            <div className="ml-4">
              <p>1. Join the INMO via this Graduate application form, <span className="font-weight-bold">and</span></p>
              <p>2. Consent to sharing their union data with Cornmarket, <span className="font-weight-bold">and</span></p>
              <p>3. Are committed as a new INMO Graduate member <span className="font-weight-bold">and</span></p>
              <p>4. Meet the eligibility criteria of the Scheme.</p>
            </div>
            <p className="mt-3">This gives graduates the time of completing an application form and avoids potential medical underwriting.</p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white p-4 rounded mb-3">
          <h2 className="h2 font-weight-bold mb-4" style={{ color: '#1e3a8a' }}>The Scheme Includes:</h2>

          <div className="row">
            {/* Left Column */}
            <div className="col-md-12 mb-3">
              <div style={blue800Style} className="text-white p-3 rounded mb-3">
                <div className="d-flex align-items-start">
                  <div className="mr-3" style={{ color: 'white', flexShrink: 0 }}>
                    <Shield size={32} />
                  </div>
                  <div>
                    <h3 className="h5 font-weight-bold">Disability Benefit</h3>
                    <p className="small mb-0">provides a replacement income if you can't work due to illness or injury</p>
                  </div>
                </div>
              </div>

              <div style={blue800Style} className="text-white p-3 rounded mb-3">
                <div className="d-flex align-items-start">
                  <div className="mr-3" style={{ color: 'white', flexShrink: 0 }}>
                    <Heart size={32} />
                  </div>
                  <div>
                    <h3 className="h5 font-weight-bold">Death Benefit</h3>
                    <p className="small mb-0">provides a lump sum of typically twice your annual salary if you die</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-md-12 mb-3">
              <div style={blue700Style} className="text-white p-3 rounded mb-3">
                <div className="d-flex align-items-start">
                  <div className="mr-3" style={{ color: 'white', flexShrink: 0 }}>
                    <FileText size={32} />
                  </div>
                  <div>
                    <h3 className="h5 font-weight-bold">Specified Illness Benefit</h3>
                    <p className="small mb-0">provides a lump sum if you are diagnosed with one of the illnesses covered</p>
                  </div>
                </div>
              </div>

              <div style={blue700Style} className="text-white p-3 rounded mb-3">
                <div className="d-flex align-items-start">
                  <div className="mr-3" style={{ color: 'white', flexShrink: 0 }}>
                    <Users size={32} />
                  </div>
                  <div>
                    <h3 className="h5 font-weight-bold">MyDoc</h3>
                    <p className="small mb-0">easy, online healthcare service for you and your family</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-4 p-3 rounded" style={{ backgroundColor: '#dbeafe' }}>
            <p className="small mb-0" style={{ color: '#1e3a8a' }}>
              <span className="font-weight-bold">For more information on the Scheme,</span><br />
              visit <span className="font-weight-bold">cornmarket.ie/inmo</span> or scan the QR code
            </p>
          </div>
        </div>

        {/* Privacy Notice */}
        <div style={blue800Style} className="text-white p-4 rounded-bottom">
          <h2 className="h3 font-weight-bold mb-3">Cornmarket and Irish Life Data Privacy Notices</h2>
          <div className="small">
            <p>Where consent to share your union membership data has been provided by you, confirmed member data will be shared with Cornmarket Group Financial Services Ltd (Scheme Administrator) and Irish Life (Scheme Insurer), for the purposes of providing eligible members with cover under the INMO Income Protection Scheme (including 9 Months Free). Cornmarket's Data Privacy Notice is available at <a href="#" className="text-white" style={{ textDecoration: 'underline' }}>www.insinmo.ie/privacy-notices</a></p>
            <p>The information provided by you on this form will be used by the INMO, Cornmarket and Irish Life. If Cornmarket already has your details on their system, they will update your contact details based on the information you provide on this form.</p>
          </div>

          <h3 className="h4 font-weight-bold mt-4 mb-3">How it works</h3>
          <div className="small">
            <p>If you consent to sharing your union membership data with Cornmarket, further details regarding the Scheme will be sent to you. Your application will be reviewed and accepted you as a new graduate member of the INMO. For full details of Scheme benefits, please go to <span className="font-weight-bold">cornmarket.ie/inmo</span>.</p>
            <p>Cover will not begin until Cornmarket writes to you confirming you have been accepted as a member of the Scheme. If accepted as a member, you can cancel your cover at any time by contacting Cornmarket.</p>
            <p>Premiums will start at the end of the 9-month free period, either automatically from your salary, or via direct debit if you provide your direct debit details.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RewardsScreen = () => {
  // Exact Tailwind color mappings
  const containerStyle = {
    background: 'linear-gradient(135deg, #0891b2 0%, #3b82f6 100%)', // from-cyan-600 to-blue-500
    height: '100%', // Changed from minHeight to height
    overflowY: 'auto', // Added for scrolling
    padding: '0.75rem'
  };

  const cyan400To300 = { background: 'linear-gradient(90deg, #22d3ee 0%, #67e8f9 100%)' }; // from-cyan-400 to-cyan-300
  const blue400To300 = { background: 'linear-gradient(90deg, #60a5fa 0%, #93c5fd 100%)' }; // from-blue-400 to-blue-300
  const cyan300To200 = { background: 'linear-gradient(90deg, #67e8f9 0%, #a5f3fc 100%)' }; // from-cyan-300 to-cyan-200
  const blue300To200 = { background: 'linear-gradient(90deg, #93c5fd 0%, #bfdbfe 100%)' }; // from-blue-300 to-blue-200
  const blue200To100 = { background: 'linear-gradient(90deg, #bfdbfe 0%, #dbeafe 100%)' }; // from-blue-200 to-blue-100

  return (
    <div style={containerStyle}>
      <div className="container" style={{ maxWidth: '800px' }}>

        {/* Header */}
        <div className="bg-white rounded-top p-4 mb-3">
          <div className="d-flex align-items-center mb-4">
            <Gift
              className="mr-3"
              style={{
                width: '60px',
                height: '60px',
                color: '#1e3a8a' // blue-900
              }}
            />
            <div>
              <h1 className="h2 font-weight-bold mb-0" style={{ color: '#1e3a8a' }}>INMO</h1>
              <p className="h5 mb-0" style={{ color: '#374151' }}>REWARDS</p> {/* gray-700 */}
              <p className="small mb-0" style={{ color: '#6b7280' }}>Supported by Cornmarket</p> {/* gray-600 */}
            </div>
            <div className="ml-auto">
              <div style={{ backgroundColor: '#1e3a8a' }} className="text-white px-3 py-2 rounded">
                <p className="small font-weight-bold mb-0">Cornmarket</p>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#eff6ff' }} className="p-4 rounded mb-4"> {/* blue-50 */}
            <p className="text-center font-weight-medium mb-2" style={{ color: '#1e3a8a' }}>
              Rewards offers new INMO members exclusive access to MyDoc, an online GP service, for 12 months and other discounts, offers, competitions and more (benefits).
            </p>
            <p className="small text-center mb-0" style={{ color: '#6b7280' }}>
              Rewards is run by Cornmarket Group Financial Services Ltd. (Cornmarket).
            </p>
          </div>

          {/* Benefits List */}
          <div className="mb-4">
            {/* 1. MyDoc */}
            <div className="d-flex align-items-center p-3 rounded mb-2" style={cyan400To300}>
              <Users className="mr-3" style={{ width: '40px', height: '40px', color: '#1e3a8a' }} />
              <p className="font-weight-medium mb-0" style={{ color: '#1e3a8a' }}>
                12 months <span className="font-weight-bold">FREE MyDoc*</span>
              </p>
            </div>

            {/* 2. Mortgage Advice */}
            <div className="d-flex align-items-center p-3 rounded mb-2" style={blue400To300}>
              <Home className="mr-3" style={{ width: '40px', height: '40px', color: '#1e3a8a' }} />
              <p className="font-weight-medium mb-0" style={{ color: '#1e3a8a' }}>
                100% <span className="font-weight-bold">FREE</span> Mortgage Advice Service**
              </p>
            </div>

            {/* 3. Income Protection */}
            <div className="d-flex align-items-center p-3 rounded mb-2" style={cyan400To300}>
              <Shield className="mr-3" style={{ width: '40px', height: '40px', color: '#1e3a8a' }} />
              <p className="font-weight-medium mb-0" style={{ color: '#1e3a8a' }}>
                9 months <span className="font-weight-bold">FREE</span> Income Protection***
              </p>
            </div>

            {/* 4. Financial Health Check */}
            <div className="d-flex align-items-center p-3 rounded mb-2" style={blue300To200}>
              <Heart className="mr-3" style={{ width: '40px', height: '40px', color: '#1e3a8a' }} />
              <p className="font-weight-medium mb-0" style={{ color: '#1e3a8a' }}>
                Your <span className="font-weight-bold">first</span> Financial Health Check
              </p>
            </div>

            {/* 5. Discount Bundle */}
            <div className="d-flex align-items-center p-3 rounded mb-2" style={cyan300To200}>
              <Percent className="mr-3" style={{ width: '40px', height: '40px', color: '#1e3a8a' }} />
              <p className="font-weight-medium mb-0" style={{ color: '#1e3a8a' }}>
                <span className="font-weight-bold">Discount Bundle</span> for Cornmarket Insurance Products
              </p>
            </div>

            {/* 6. Competitions */}
            <div className="d-flex align-items-center p-3 rounded mb-2" style={blue200To100}>
              <Trophy className="mr-3" style={{ width: '40px', height: '40px', color: '#1e3a8a' }} />
              <p className="font-weight-medium mb-0" style={{ color: '#1e3a8a' }}>
                Competitions, webinars and <span className="font-weight-bold">more</span>
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mb-4 small" style={{ color: '#374151' }}> {/* gray-700 */}
            <p className="mb-1">To get more information about Rewards Benefits, visit: <span className="font-weight-semibold">Cornmarket.ie/rewards-inmo/</span></p>
            <p className="mb-1">For Rewards Membership Terms & Conditions, visit: <span className="font-weight-semibold">Cornmarket.ie/rewards-club-terms</span></p>
            <p className="mb-1">For Income Data Protection Statement, visit: <span className="font-weight-semibold">Cornmarket.ie/rewards-privacy-notices</span></p>
            <p className="mb-0 font-italic">*Terms and conditions apply</p>
          </div>
        </div>

        {/* CTA */}
        <div style={{ backgroundColor: '#1e3a8a' }} className="text-white p-4 rounded-bottom text-center">
          <p className="h5 font-weight-bold mb-1">Don't miss out. Join Rewards today by ticking the box</p>
          <p className="mb-3">on the INMO application form below</p>
          <div className="small" style={{ opacity: 0.75 }}>
            <p className="mb-1">Cornmarket Group Financial Services Ltd. is regulated by the Central Bank of Ireland.</p>
            <p className="mb-0">A member of the Irish Life Group Ltd. which is part of the Great-West Lifeco Group of companies.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const IncomeProtectionTooltip = () => {
  const location = useLocation(); // Use the hook
  const navigate = useNavigate();
  
  const getScreenFromPath = () => {
    const pathSegments = location.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];

    // Check if the last segment is 'insurance' or 'rewards'
    if (lastSegment === 'rewards') {
      return 'rewards';
      
    }
    // Default to 'insurance' for '/inmoRewards' or any other path
    return 'insurance';
  };
  
  const [activeScreen, setActiveScreen] = useState(getScreenFromPath());
  
  useEffect(() => {
    const newScreen = getScreenFromPath();
    if (newScreen !== activeScreen) {
      setActiveScreen(newScreen);
    }
  }, [location.pathname, activeScreen]); // Added activeScreen to dependency array
// Main container style with full height and scrolling
  const mainContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden'
  };

  const contentContainerStyle = {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#f3f4f6' // gray-100 for background
  };

  return (
    <div style={mainContainerStyle}>
      {/* Navigation Tabs */}
      {/* <div className="bg-gray-800 p-4 flex justify-center gap-4">
        <button
          onClick={() => setActiveScreen('insurance')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeScreen === 'insurance'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Income Protection Scheme
        </button>
        <button
          onClick={() => setActiveScreen('rewards')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeScreen === 'rewards'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          INMO Rewards
        </button>
      </div> */}

      {/* Active Screen */}
      <div style={contentContainerStyle}>
        {activeScreen === 'insurance' ? <InsuranceScreen /> : <RewardsScreen />}
      </div>
    </div>
  );
};

export default IncomeProtectionTooltip;