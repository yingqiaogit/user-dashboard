const Header = ({ title }: { title: string }) => {
    return (
        <header>
            <h1>{title}</h1>
            <p className="header-subtitle">
                Start by selecting a role from the dropdown below to filter the user list.
            </p>
        </header>
    );
};
export default Header;