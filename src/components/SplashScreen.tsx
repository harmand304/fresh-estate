
import { useEffect } from 'react';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  useEffect(() => {
    // Give the system time to load images
    const timer = setTimeout(() => {
      onFinish();
    }, 3000); // 3 seconds to load

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      {/* Nested Spinner Container */}
      <div className="spinner-container">
        <div className="spinner">
          <div className="spinner">
            <div className="spinner">
              <div className="spinner">
                <div className="spinner">
                  <div className="spinner"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spinner Styles */}
      <style>{`
        .spinner-container {
          width: 150px;
          height: 150px;
          position: relative;
          margin: 30px auto;
          overflow: hidden;
        }

        .spinner {
          position: absolute;
          width: calc(100% - 9.9px);
          height: calc(100% - 9.9px);
          border: 5px solid transparent;
          border-radius: 50%;
          border-top-color: #22c55e;
          animation: spin 5s cubic-bezier(0.17, 0.49, 0.96, 0.79) infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
