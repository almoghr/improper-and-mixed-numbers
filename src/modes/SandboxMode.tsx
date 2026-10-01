import React from 'react';
import { ManipulativeWorkspace } from '../components/manipulatives/ManipulativeWorkspace';
import { Sparkles, HelpCircle } from 'lucide-react';

export const SandboxMode: React.FC = () => {
  return (
    <div className="mode-container sandbox-container">
      {/* Banner */}
      <div className="mode-header-card">
        <div className="header-info">
          <div className="badge-pill purple">
            <Sparkles size={14} />
            <span>אימון ומעבדה חופשית</span>
          </div>
          <h2 className="mode-headline">מעבדת השברים החופשית</h2>
          <p className="mode-subtext">
            בחר כמה שלמים שתרצה, חלק אותם לכמה חלקים שתבחר (שנה את המכנה), וצבע חלקים כדי לראות איך שבר מדומה הופך למספר מעורב ולהפך בזמן אמת!
          </p>
        </div>
      </div>

      {/* Main Interactive Workspace */}
      <div className="sandbox-workspace-card">
        <ManipulativeWorkspace
          initialWholes={3}
          initialDenominator={6}
          title="חקור בחופשיות: לחץ על החלקים לצביעה"
        />
      </div>

      {/* Educational Tips Drawer */}
      <div className="educational-guide-card">
        <div className="guide-header">
          <HelpCircle size={20} className="guide-icon" />
          <h3>כללי הברזל של שברים מדומים ומספרים מעורבים:</h3>
        </div>
        <div className="guide-grid">
          <div className="guide-item">
            <h4>מהו שבר מדומה?</h4>
            <p>
              שבר שבו ה<strong>מונה גדול מהמכנה</strong> (למשל 8/6). זה אומר שיש לנו יותר חלקים משלם אחד שלם!
            </p>
          </div>
          <div className="guide-item">
            <h4>מהו מספר מעורב?</h4>
            <p>
              מספר המורכב מ<strong>שלמים שלמים ושבר פשוט</strong> (למשל 1 ו-2/6). הוא מראה בדיוק כמה שלמים מלאים יש.
            </p>
          </div>
          <div className="guide-item">
            <h4>איך עוברים ביניהם?</h4>
            <p>
              <strong>משבר מדומה למעורב</strong> מחלקים (מונה ÷ מכנה = שלם, שארית = מונה).<br />
              <strong>ממעורב לשבר מדומה:</strong> מכפילים (שלם × מכנה) ומוסיפים את המונה!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
