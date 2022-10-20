export function paginate<T>(array: T[], page: number = 1, perPage: number = 10) {
    return array.slice((page - 1) * perPage, perPage * page);
}