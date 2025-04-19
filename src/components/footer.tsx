export const Footer = () => {
  const builtByText = "built by";
  const zeroDayText = "Zero-Day";

  return (
    <div className="flex justify-center items-center pb-12 pt-5 font-mono text-md">
      <p className="text-[#6a6a6ae1]">
        <span
          className="inline-block transition-all duration-300 scramble-text"
          data-text={builtByText}
        >
          {builtByText}
        </span>{" "}
        <span
          className="text-[#F90D2A] inline-block transition-all duration-300 scramble-text"
          data-text={zeroDayText}
        >
          {zeroDayText}
        </span>
        <script
          dangerouslySetInnerHTML={{
            __html: `
                document.addEventListener('DOMContentLoaded', () => {
                  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
                  const charLength = characters.length;
                  const scrambleElements = document.querySelectorAll('.scramble-text');
                  
                  scrambleElements.forEach(element => {
                    const originalText = element.getAttribute('data-text');
                    if (!originalText) return;
                    
                    const textArray = originalText.split('');
                    
                    element.addEventListener('mouseenter', () => {
                      startScramble(scrambleElements, textArray);
                    });
                    
                    element.addEventListener('mouseleave', () => {
                      stopScramble(scrambleElements);
                    });
                  });
                  
                  function startScramble(elements, textArray) {
                    elements.forEach(el => {
                      const originalText = el.getAttribute('data-text');
                      if (!originalText) return;
                      
                      let iterations = 0;
                      const maxIterations = 10;
                      const halfMaxIterations = maxIterations / 2;
                      
                      el.scrambleInterval = setInterval(() => {
                        let newText = '';
                        for (let i = 0; i < originalText.length; i++) {
                          const char = originalText[i];
                          if (char === ' ') {
                            newText += ' ';
                            continue;
                          }
                          
                          if (iterations > halfMaxIterations && Math.random() < 0.5) {
                            newText += char;
                          } else {
                            newText += characters[Math.floor(Math.random() * charLength)];
                          }
                        }
                        
                        el.textContent = newText;
                        
                        if (iterations >= maxIterations) {
                          clearInterval(el.scrambleInterval);
                          el.textContent = originalText;
                        }
                        
                        iterations++;
                      }, 70);
                    });
                  }
                  
                  function stopScramble(elements) {
                    elements.forEach(el => {
                      if (el.scrambleInterval) {
                        clearInterval(el.scrambleInterval);
                        el.textContent = el.getAttribute('data-text');
                      }
                    });
                  }
                });
              `,
          }}
        />
      </p>
    </div>
  );
};
