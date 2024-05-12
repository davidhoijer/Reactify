import { useQuery } from '@tanstack/react-query';

export type TGithubUser = {
    name: string;
};

export const fetchGithubUser = async () => {
    const res = await fetch('https://api.github.com/users/kiranm27');
    if (!res.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await res.json();
    const user: TGithubUser = {
        name: data?.name || '',
    };
    return user;
};

export const useGithubUser = () => {
    return useQuery({queryKey:['githubUser'], queryFn: fetchGithubUser});
};
