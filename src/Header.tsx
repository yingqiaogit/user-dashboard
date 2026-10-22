
const Header = ({ title }: { title: string }) => {
    return (    
        <header>
            <h1>{title}</h1>    
                Start by selecting a role from the dropdown below to filter the user list.                 
        </header>
    );
};
export default Header;