import { useEffect } from 'react';
import { useHistory } from 'react-router';
import { PrimaryNavigationLink } from 'UI/Layout/Routes/PrimaryNavigation';

const NavTab = ({ icon, path, label, active }: PrimaryNavigationLink) => {
  const history = useHistory();

  useEffect(() => {
    const scrollContainer = document.getElementById('ButtonWrapper');
    const rightIconContainer = document.getElementById('right-icon-container');
    const leftIconContainer = document.getElementById('left-icon-container');

    if (scrollContainer !== null && rightIconContainer !== null && leftIconContainer !== null) {
      // workaround for scroll = client on load race
      setTimeout(() => {
        if (scrollContainer.scrollWidth > scrollContainer.clientWidth) {
          rightIconContainer.style.visibility = 'visible';
        }
      }, 100);

      scrollContainer.addEventListener('scroll', () => {
        const enableVisibleLeft = scrollContainer.scrollLeft <= 5;
        const enableVisibleRight =
          scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 5;
        if (enableVisibleRight) {
          rightIconContainer.style.visibility = 'visible';
          leftIconContainer.style.visibility = 'hidden';
        } else if (enableVisibleLeft) {
          rightIconContainer.style.visibility = 'hidden';
          leftIconContainer.style.visibility = 'visible';
        } else {
          rightIconContainer.style.visibility = 'visible';
          leftIconContainer.style.visibility = 'visible';
        }
      });
    }
  }, []);

  return (
    <button
      className={'Tab' + (active ? ' Tab__Indicator' : '')}
      onClick={() => {
        history.push(path);
      }}
    >
      <div className="Tab__Content">{icon}</div>
      <div className="Tab__Label">{label}</div>
    </button>
  );
};

export default NavTab;
