import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('TrustGuard Error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{minHeight:'100vh',background:'#070B14',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
          <div style={{textAlign:'center',maxWidth:480,padding:40}}>
            <div style={{fontSize:48,marginBottom:16}}>⚠</div>
            <h1 style={{color:'#EF4444',fontSize:22,fontWeight:800,marginBottom:12}}>Something went wrong</h1>
            <p style={{color:'#64748B',fontSize:13,lineHeight:1.8,marginBottom:24}}>
              TrustGuard encountered an unexpected error.<br/>
              {this.state.error?.message && <code style={{background:'#1E293B',padding:'2px 8px',borderRadius:4,color:'#F87171',fontSize:11}}>{this.state.error.message}</code>}
            </p>
            <button onClick={() => window.location.reload()} style={{background:'#2563EB',color:'#fff',border:'none',borderRadius:10,padding:'12px 28px',fontSize:12,fontWeight:800,cursor:'pointer',letterSpacing:'0.1em'}}>
              RELOAD APP
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
